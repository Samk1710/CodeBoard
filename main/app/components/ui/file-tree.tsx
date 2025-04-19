'use client'

import * as React from 'react'
import { ChevronDown, ChevronRight, File } from 'lucide-react'

interface TreeElement {
  id: string
  isSelectable: boolean
  name: string
  children?: TreeElement[]
}

interface TreeProps {
  elements: TreeElement[]
  className?: string
  initialSelectedId?: string
  initialExpandedItems?: string[]
  children?: React.ReactNode
}

interface FolderProps {
  element: string
  value: string
  children?: React.ReactNode
}

interface FileProps {
  value: string
  children?: React.ReactNode
}

export function Tree({ elements, className, initialSelectedId, initialExpandedItems, children }: TreeProps) {
  const [selectedId, setSelectedId] = React.useState(initialSelectedId)
  const [expandedItems, setExpandedItems] = React.useState<string[]>(initialExpandedItems || [])

  const toggleExpand = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  return (
    <div className={className}>
      {children}
    </div>
  )
}

export function Folder({ element, value, children }: FolderProps) {
  const [isExpanded, setIsExpanded] = React.useState(true)

  return (
    <div className="flex flex-col">
      <div
        className="flex items-center gap-1 py-1 cursor-pointer hover:bg-gray-700 rounded px-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span className="text-gray-300">{element}</span>
      </div>
      {isExpanded && (
        <div className="ml-4">
          {children}
        </div>
      )}
    </div>
  )
}

export function File({ value, children }: FileProps) {
  return (
    <div className="flex items-center gap-1 py-1 hover:bg-gray-700 rounded px-2">
      <File size={16} className="text-gray-400" />
      <span className="text-gray-300">{children}</span>
    </div>
  )
} 