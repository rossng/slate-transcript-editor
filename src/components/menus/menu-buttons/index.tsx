import { Button, Divider, Flex, Link, Menu, MenuButton, MenuItem, MenuList, Text, Tooltip } from '@chakra-ui/react';
import React, { PropsWithChildren } from 'react';
import { MdImportExport, MdInsertEmoticon, MdKeyboardArrowDown, MdMusicNote, MdRedo, MdSave, MdUndo } from 'react-icons/md';
import subtitlesExportOptionsList from '../../../util/export-adapters/subtitles-generator/list.js';
import { useTranscriptEditorContext } from '../../misc/transcript-editor-context';

const REPLACE_WHOLE_TEXT_INSTRUCTION = `Replace whole text.

Advanced feature, if you already have an accurate transcription for the whole text, and you want to restore timecodes for it, you can use this to replace the text in this transcript.

For now this is an experimental feature.

It expects plain text, with paragraph breaks as new line breaks but no speakers.`;

function MenuButtons({ children }: PropsWithChildren<Record<never, never>>): JSX.Element {
  const { editor, isProcessing, isContentSaved, isEditable, insertMusicNote, insertTextInaudible, handleExport, handleSave, handleReplaceText } =
    useTranscriptEditorContext();

  const handleUndo = () => {
    editor.undo();
  };

  const handleRedo = () => {
    editor.redo();
  };

  return (
    <Flex direction="column" justifyContent="flex-start" alignItems="stretch">
      <Menu>
        <MenuButton as={Button}>
          <MdSave color="primary" /> <MdKeyboardArrowDown color="primary" />
        </MenuButton>
        <MenuList>
          <MenuItem disabled>
            <Link style={{ color: 'black' }}>Text Export</Link>
          </MenuItem>
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
          <Divider />
          <MenuItem isDisabled>
            <Link style={{ color: 'black' }}>Closed Captions Export</Link>
          </MenuItem>
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
          <Divider />
          <MenuItem isDisabled={true}>
            <Link style={{ color: 'black' }}>Developer options</Link>
          </MenuItem>
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
        </MenuList>
      </Menu>

      {isEditable && (
        <Tooltip title="save">
          <Button disabled={isProcessing} onClick={handleSave} color="primary">
            <MdSave color={isContentSaved ? 'primary' : 'secondary'} />
          </Button>
        </Tooltip>
      )}
      {isEditable && (
        <>
          <Tooltip label="Put the cursor at a point where you'd want to add [INAUDIBLE] text, and click this button">
            <Button disabled={isProcessing} onClick={insertTextInaudible} color="primary">
              <MdInsertEmoticon color="primary" />
            </Button>
          </Tooltip>

          <Tooltip label="Insert a ♪ in the text">
            <Button disabled={isProcessing} onClick={insertMusicNote} color="primary">
              <MdMusicNote color="primary" />
            </Button>
          </Tooltip>

          <Tooltip
            label={
              <Text>
                Undo <br />
                <code>cmd</code> <code>z</code>
              </Text>
            }
          >
            <Button onClick={handleUndo} color="primary">
              <MdUndo color="primary" />
            </Button>
          </Tooltip>

          <Tooltip
            label={
              <Text>
                Redo <br /> <code>cmd</code> <code>shift</code> <code>z</code>
              </Text>
            }
          >
            <Button onClick={handleRedo} color="primary">
              <MdRedo color="primary" />
            </Button>
          </Tooltip>
          <Tooltip label={REPLACE_WHOLE_TEXT_INSTRUCTION}>
            <Button onClick={handleReplaceText} color="primary">
              <MdImportExport color="primary" />
            </Button>
          </Tooltip>
        </>
      )}
      {children}
    </Flex>
  );
}

export default MenuButtons;
