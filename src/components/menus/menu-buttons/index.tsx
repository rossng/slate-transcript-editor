import { Button, Divider, Flex, Link, Menu, MenuButton, MenuGroup, MenuItem, MenuList, Tooltip, VisuallyHidden } from '@chakra-ui/react';
import React, { PropsWithChildren } from 'react';
import { MdImportExport, MdInsertEmoticon, MdKeyboardArrowDown, MdMusicNote, MdRedo, MdSave, MdUndo } from 'react-icons/md';
import subtitlesExportOptionsList from '../../../util/export-adapters/subtitles-generator/list.js';
import { useTranscriptEditorContext } from '../../misc/transcript-editor-context';

const REPLACE_WHOLE_TEXT_INSTRUCTION = `Replace whole text.

Advanced feature, if you already have an accurate transcription for the whole text, and you want to restore timecodes for it, you can use this to replace the text in this transcript.

For now this is an experimental feature.

It expects plain text, with paragraph breaks as new line breaks but no speakers.`;

export function MenuButtons({ children }: PropsWithChildren<Record<never, never>>): JSX.Element {
  const { editor, isProcessing, isEditable, insertMusicNote, insertTextInaudible, handleExport, handleSave, handleReplaceText } =
    useTranscriptEditorContext();

  const handleUndo = () => {
    editor.undo();
  };

  const handleRedo = () => {
    editor.redo();
  };

  return (
    <Flex direction="column" justifyContent="flex-start" alignItems="stretch" mx={2} gridRowGap={2}>
      <Menu>
        <Tooltip label="Export">
          <MenuButton
            as={Button}
            rightIcon={
              <>
                <MdSave color="primary" /> <MdKeyboardArrowDown color="primary" />
              </>
            }
          >
            <VisuallyHidden>Export</VisuallyHidden>
          </MenuButton>
        </Tooltip>
        <MenuList maxH="70vh" overflowY="auto">
          <MenuGroup title="Text">
            <MenuItem
              onClick={() => {
                handleExport({
                  type: 'text',
                  ext: 'txt',
                  speakers: false,
                  timecodes: false,
                  isDownload: true,
                });
              }}
            >
              <Link color="primary">
                Text (<code>.txt</code>)
              </Link>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleExport({
                  type: 'text',
                  ext: 'txt',
                  speakers: true,
                  timecodes: false,
                  isDownload: true,
                });
              }}
            >
              <Link color="primary">Text (Speakers)</Link>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleExport({
                  type: 'text',
                  ext: 'txt',
                  speakers: false,
                  timecodes: true,
                  isDownload: true,
                });
              }}
            >
              <Link color="primary">Text (Timecodes)</Link>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleExport({
                  type: 'text',
                  ext: 'txt',
                  speakers: true,
                  timecodes: true,
                  isDownload: true,
                });
              }}
            >
              <Link color="primary"> Text (Speakers &amp; Timecodes)</Link>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleExport({
                  type: 'text',
                  ext: 'txt',
                  speakers: true,
                  timecodes: true,
                  atlasFormat: true,
                  isDownload: true,
                });
              }}
            >
              <Link color="primary"> Text (Atlas format)</Link>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                handleExport({
                  type: 'word',
                  ext: 'docx',
                  speakers: false,
                  timecodes: false,
                  isDownload: true,
                });
              }}
            >
              <Link color="primary">
                {' '}
                Word (<code>.docx</code>)
              </Link>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleExport({
                  type: 'word',
                  ext: 'docx',
                  speakers: true,
                  timecodes: false,
                  isDownload: true,
                });
              }}
            >
              <Link color="primary"> Word (Speakers)</Link>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleExport({
                  type: 'word',
                  ext: 'docx',
                  speakers: false,
                  timecodes: true,
                  isDownload: true,
                });
              }}
            >
              <Link color="primary"> Word (Timecodes)</Link>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleExport({
                  type: 'word',
                  ext: 'docx',
                  speakers: true,
                  timecodes: true,
                  isDownload: true,
                });
              }}
            >
              <Link color="primary"> Word (Speakers &amp; Timecodes)</Link>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleExport({
                  type: 'word',
                  ext: 'docx',
                  speakers: false,
                  timecodes: false,
                  inlineTimecodes: true,
                  hideTitle: true,
                });
              }}
            >
              <Link color="primary"> Word (OHMS)</Link>
            </MenuItem>
          </MenuGroup>

          <MenuGroup title="Closed Captions">
            {subtitlesExportOptionsList.map(({ type, label, ext }, index) => {
              return (
                <MenuItem
                  key={index + label}
                  onClick={() => {
                    handleExport({ type, ext, isDownload: true });
                  }}
                >
                  <Link color="primary">
                    {label} (<code>.{ext}</code>)
                  </Link>
                </MenuItem>
              );
            })}
          </MenuGroup>

          <MenuGroup title="Developer">
            <MenuItem
              onClick={() => {
                handleExport({
                  type: 'json-slate',
                  ext: 'json',
                  speakers: true,
                  timecodes: true,
                  isDownload: true,
                });
              }}
            >
              <Link color="primary">
                SlateJs (<code>.json</code>)
              </Link>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleExport({
                  type: 'json-digitalpaperedit',
                  ext: 'json',
                  speakers: true,
                  timecodes: true,
                  isDownload: true,
                });
              }}
            >
              <Link color="primary">
                DPE (<code>.json</code>)
              </Link>
            </MenuItem>
          </MenuGroup>
        </MenuList>
      </Menu>

      {isEditable && (
        <Tooltip label="Save">
          <Button isDisabled={isProcessing} onClick={handleSave}>
            <MdSave aria-label="save" />
          </Button>
        </Tooltip>
      )}
      {isEditable && (
        <>
          <Tooltip label="Put the cursor at a point where you'd want to add [INAUDIBLE] text, and click this button">
            <Button isDisabled={isProcessing} onClick={insertTextInaudible}>
              <MdInsertEmoticon aria-label="insert [inaudible]" />
            </Button>
          </Tooltip>

          <Tooltip label="Insert a ♪ in the text">
            <Button isDisabled={isProcessing} onClick={insertMusicNote}>
              <MdMusicNote aria-label="insert music note" />
            </Button>
          </Tooltip>

          <Tooltip label="Undo">
            <Button onClick={handleUndo}>
              <MdUndo aria-label="undo" />
            </Button>
          </Tooltip>

          <Tooltip label="Redo">
            <Button onClick={handleRedo} color="primary">
              <MdRedo aria-label="redo" />
            </Button>
          </Tooltip>
          <Tooltip label={REPLACE_WHOLE_TEXT_INSTRUCTION}>
            <Button onClick={handleReplaceText} color="primary">
              <MdImportExport aria-label="replace-whole-text" />
            </Button>
          </Tooltip>
        </>
      )}
      {children}
    </Flex>
  );
}
