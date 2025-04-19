'use client'

import { Tree, Folder, File } from '@/registry/magicui/file-tree'

const ELEMENTS = [
  {
    id: "1",
    isSelectable: true,
    name: "src",
    children: [
      {
        id: "2",
        isSelectable: true,
        name: "app",
        children: [
          {
            id: "3",
            isSelectable: true,
            name: "layout.tsx",
          },
          {
            id: "4",
            isSelectable: true,
            name: "page.tsx",
          },
        ],
      },
      {
        id: "5",
        isSelectable: true,
        name: "components",
        children: [
          {
            id: "6",
            isSelectable: true,
            name: "ui",
            children: [
              {
                id: "7",
                isSelectable: true,
                name: "button.tsx",
              },
            ],
          },
          {
            id: "8",
            isSelectable: true,
            name: "header.tsx",
          },
          {
            id: "9",
            isSelectable: true,
            name: "footer.tsx",
          },
        ],
      },
      {
        id: "10",
        isSelectable: true,
        name: "lib",
        children: [
          {
            id: "11",
            isSelectable: true,
            name: "utils.ts",
          },
        ],
      },
    ],
  },
]

export default function TryPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">File Structure Demo</h2>
          <div className="relative flex h-[600px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-gray-800">
            <Tree
              className="overflow-hidden rounded-md bg-gray-800 p-2"
              initialSelectedId="7"
              initialExpandedItems={[
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "10",
                "11",
              ]}
              elements={ELEMENTS}
            >
              <Folder element="src" value="1">
                <Folder value="2" element="app">
                  <File value="3">
                    <p>layout.tsx</p>
                  </File>
                  <File value="4">
                    <p>page.tsx</p>
                  </File>
                </Folder>
                <Folder value="5" element="components">
                  <Folder value="6" element="ui">
                    <File value="7">
                      <p>button.tsx</p>
                    </File>
                  </Folder>
                  <File value="8">
                    <p>header.tsx</p>
                  </File>
                  <File value="9">
                    <p>footer.tsx</p>
                  </File>
                </Folder>
                <Folder value="10" element="lib">
                  <File value="11">
                    <p>utils.ts</p>
                  </File>
                </Folder>
              </Folder>
            </Tree>
          </div>
        </div>
      </div>
    </div>
  )
} 