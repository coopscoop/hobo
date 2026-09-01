'use client';

import {
    MDXEditor,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    linkPlugin,
    linkDialogPlugin,
    markdownShortcutPlugin,
    tablePlugin,
    toolbarPlugin,
    UndoRedo,
    BoldItalicUnderlineToggles,
    ListsToggle,
    CreateLink,
    BlockTypeSelect,
    InsertThematicBreak,
    InsertTable,
    Separator,
    HighlightToggle,
    InsertImage,
    KitchenSinkToolbar,
} from '@mdxeditor/editor';
interface Props {
    markdown: string;
    readOnly: boolean;
    onChange?: (markdown: string) => void;
}

export default function InitializedMDXEditor({ markdown, readOnly, onChange }: Props) {
    return (
        <MDXEditor
            markdown={markdown}
            readOnly={readOnly}
            onChange={onChange}
            plugins={[
                headingsPlugin(),
                listsPlugin(),
                quotePlugin(),
                thematicBreakPlugin(),
                linkPlugin(),
                linkDialogPlugin(),
                tablePlugin(),
                markdownShortcutPlugin(),
                ...(readOnly
                    ? []
                    : [
                        toolbarPlugin({
                            toolbarContents: () => (
                                <>
                                    <UndoRedo />
                                    <Separator />
                                    <BoldItalicUnderlineToggles />
                                    <Separator />
                                    <BlockTypeSelect />
                                    <Separator />
                                    <ListsToggle />
                                    <CreateLink />
                                    <InsertThematicBreak />
                                    <InsertTable />
                                    <HighlightToggle />
                                    <InsertImage />
                                </>
                            ),
                        }),
                    ]),
            ]}
        />
    );
}
