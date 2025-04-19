'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface Convention {
  category: string;
  description: string;
  examples: string[];
  source: string;
}

interface ConventionListProps {
  conventions: Convention[];
}

export function ConventionList({ conventions }: ConventionListProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {conventions.map((convention, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="text-lg font-semibold">
            {convention.category}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <p className="text-gray-700">{convention.description}</p>
              
              {convention.examples.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium">Examples:</h4>
                  <ul className="list-inside list-disc space-y-1">
                    {convention.examples.map((example, i) => (
                      <li key={i} className="text-gray-600">{example}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <p className="text-sm text-gray-500">
                Source: {convention.source}
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
} 