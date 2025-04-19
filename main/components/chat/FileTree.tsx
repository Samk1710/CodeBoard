'use client';

import { useEffect, useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FileNode {
  path: string;
  type: 'file' | 'dir';
  children?: FileNode[];
}

interface FileTreeProps {
  repo: string;
}

export function FileTree({ repo }: FileTreeProps) {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const response = await fetch(`/api/repo/tree?repo=${repo}`);
        const data = await response.json();
        setTree(data.tree);
      } catch (error) {
        console.error('Error fetching file tree:', error);
      }
    };

    fetchTree();
  }, [repo]);

  const toggleExpand = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderNode = (node: FileNode, level: number = 0) => {
    const isExpanded = expanded.has(node.path);
    const Icon = node.type === 'dir' ? Folder : File;
    const Chevron = isExpanded ? ChevronDown : ChevronRight;

    return (
      <div key={node.path}>
        <div
          className="flex items-center gap-2 py-1 hover:bg-muted"
          style={{ paddingLeft: `${level * 1.5}rem` }}
        >
          {node.type === 'dir' && (
            <button
              onClick={() => toggleExpand(node.path)}
              className="flex h-6 w-6 items-center justify-center"
            >
              <Chevron className="h-4 w-4" />
            </button>
          )}
          <Icon className="h-4 w-4" />
          <span className="text-sm">{node.path.split('/').pop()}</span>
        </div>
        {node.type === 'dir' && isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <ScrollArea className="h-[600px] rounded-md border">
      <div className="p-2">
        {tree.map((node) => renderNode(node))}
      </div>
    </ScrollArea>
  );
} 