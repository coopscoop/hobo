'use client'

import dynamic from 'next/dynamic'

const Editor = dynamic(() => import('@/components/editor/Editor'), {
  ssr: false,
})

// to use a 'markdown' tag is required, use an onchange to grab the contents
// <EditorClient markdown="# Hello world" onChange={(md) => console.log(md)} />

export default Editor
