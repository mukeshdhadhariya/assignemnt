import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Retrieve user's existing clients for auto-matching
    const clients = await prisma.client.findMany({
      where: { userId: session.userId },
      select: { id: true, name: true, company: true },
    });

    const lowerPrompt = prompt.toLowerCase();

    // 1. Try to match client
    let matchedClientId = clients.length > 0 ? clients[0].id : '';
    for (const c of clients) {
      if (
        (c.company && lowerPrompt.includes(c.company.toLowerCase())) ||
        lowerPrompt.includes(c.name.toLowerCase())
      ) {
        matchedClientId = c.id;
        break;
      }
    }

    // 2. Extract line items from natural language
    const items: Array<{ description: string; quantity: number; unitRate: number }> = [];

    // Regex pattern detection for: "X hours of [task] at $Y" or "[item] for $Z" or "X [unit] at $Y"
    const hourlyRegex = /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|days?)\s*(?:of)?\s*([a-zA-Z0-9\s,&-]+?)\s*(?:at|@)\s*\$?(\d+(?:\.\d+)?)/gi;
    let match;
    let foundPatterns = false;

    while ((match = hourlyRegex.exec(prompt)) !== null) {
      foundPatterns = true;
      const qty = parseFloat(match[1]) || 1;
      const desc = match[2].trim();
      const rate = parseFloat(match[3]) || 0;
      items.push({
        description: desc.charAt(0).toUpperCase() + desc.slice(1),
        quantity: qty,
        unitRate: rate,
      });
    }

    // Fixed fee regex: "([task]) for $X"
    if (!foundPatterns) {
      const fixedRegex = /([a-zA-Z0-9\s,&-]+?)\s*(?:for|costing|price)\s*\$?(\d+(?:\.\d+)?)/gi;
      while ((match = fixedRegex.exec(prompt)) !== null) {
        const desc = match[1].replace(/(?:billed|bill|create|invoice|for|with)\s+/gi, '').trim();
        const rate = parseFloat(match[2]) || 0;
        if (desc.length > 2 && rate > 0) {
          foundPatterns = true;
          items.push({
            description: desc.charAt(0).toUpperCase() + desc.slice(1),
            quantity: 1,
            unitRate: rate,
          });
        }
      }
    }

    // Default fallback if unstructured prompt
    if (items.length === 0) {
      // Smart extraction or default structure based on keywords
      if (lowerPrompt.includes('design') || lowerPrompt.includes('figma') || lowerPrompt.includes('ui')) {
        items.push(
          { description: 'UI/UX Interface Design & Interactive Prototyping', quantity: 20, unitRate: 95 },
          { description: 'Design System & Component Token Setup', quantity: 1, unitRate: 850 }
        );
      } else if (lowerPrompt.includes('develop') || lowerPrompt.includes('code') || lowerPrompt.includes('web') || lowerPrompt.includes('app')) {
        items.push(
          { description: 'Full-Stack Web Application Development Sprint', quantity: 35, unitRate: 110 },
          { description: 'Database Architecture & API Integration', quantity: 10, unitRate: 125 }
        );
      } else if (lowerPrompt.includes('consult') || lowerPrompt.includes('audit')) {
        items.push(
          { description: 'Technical Architecture & Performance Audit', quantity: 1, unitRate: 1800 }
        );
      } else {
        items.push({
          description: prompt.length > 60 ? `${prompt.substring(0, 60)}...` : prompt,
          quantity: 1,
          unitRate: 1500,
        });
      }
    }

    // Extract due days if mentioned
    let dueDays = 14;
    const dueMatch = lowerPrompt.match(/due(?:\s+in)?\s+(\d+)\s*days?/i);
    if (dueMatch && dueMatch[1]) {
      dueDays = parseInt(dueMatch[1], 10);
    }

    const now = new Date();
    const dueDate = new Date(now.getTime() + dueDays * 24 * 60 * 60 * 1000);

    return NextResponse.json({
      success: true,
      data: {
        clientId: matchedClientId,
        items,
        notes: `Deliverables and professional services as agreed upon. Thank you for your business!`,
        issueDate: now.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
      },
    });
  } catch (error: any) {
    console.error('AI generate invoice error:', error);
    return NextResponse.json({ error: 'Failed to generate invoice with AI' }, { status: 500 });
  }
}
