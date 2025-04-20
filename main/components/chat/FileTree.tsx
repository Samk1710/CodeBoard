'use client';

import { useEffect, useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, ExternalLink } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FileNode {
  path: string;
  type: 'file' | 'dir';
  children?: FileNode[];
  url?: string;
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

  const handleFileClick = (node: FileNode) => {
    if (node.type === 'file' && repo) {
      // Convert the repo URL to raw GitHub URL format
      const repoPath = repo.replace('github.com', 'raw.githubusercontent.com').replace(/\.git$/, '');
      const branch = 'main'; // You might want to make this dynamic
      const fileUrl = `${repoPath}/${branch}/${node.path}`;
      window.open(fileUrl, '_blank');
    }
  };

  const renderNode = (node: FileNode, level: number = 0) => {
    const isExpanded = expanded.has(node.path);
    const Icon = node.type === 'dir' ? Folder : File;
    const Chevron = isExpanded ? ChevronDown : ChevronRight;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-2 py-1 px-2 hover:bg-white/10 rounded ${
            node.type === 'file' ? 'cursor-pointer' : ''
          }`}
          style={{ paddingLeft: `${level * 1.5}rem` }}
          onClick={() => node.type === 'file' ? handleFileClick(node) : toggleExpand(node.path)}
        >
          {node.type === 'dir' && (
            <Chevron className="h-4 w-4 text-gray-400" />
          )}
          <Icon className={`h-4 w-4 ${node.type === 'dir' ? 'text-yellow-400' : 'text-blue-400'}`} />
          <span className="text-sm text-gray-200">{node.path.split('/').pop()}</span>
          {node.type === 'file' && (
            <ExternalLink className="h-3 w-3 text-gray-400 ml-auto" />
          )}
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
    <ScrollArea className="h-[calc(80vh-8rem)] rounded-md">
      <div className="p-2">
        {tree.map((node) => renderNode(node))}
      </div>
    </ScrollArea>
  );
}