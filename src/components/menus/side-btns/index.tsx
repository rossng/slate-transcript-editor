import { Button, Divider, Flex, Link, Menu, MenuButton, MenuItem, MenuList, Text, Tooltip } from '@chakra-ui/react';
import React, { PropsWithChildren } from 'react';
import { MdImportExport, MdInsertEmoticon, MdKeyboardArrowDown, MdMusicNote, MdRedo, MdSave, MdUndo } from 'react-icons/md';
import { ExportData } from 'util/export-adapters';
import subtitlesExportOptionsList from '../../../util/export-adapters/subtitles-generator/list.js';
import { useTranscriptEditorContext } from '../../misc/transcript-editor-context';

function SideBtns({
  handleExport,
  handleReplaceText,
  handleSave,
  REPLACE_WHOLE_TEXT_INSTRUCTION,
  children,
}: PropsWithChildren<{
  handleExport: (data: ExportData) => Promise<string>;
  handleReplaceText: () => void;
  handleSave: () => void;
  REPLACE_WHOLE_TEXT_INSTRUCTION: string;
}>): JSX.Element {
  const { editor, isProcessing, isContentSaved, isEditable, insertMusicNote, insertTextInaudible } = useTranscriptEditorContext();

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
          {/* TODO: disabling until find a way to handle timecodes and alignment on paragraph break */}
          {/* <Tooltip
        title={`To insert a paragraph break, and split a paragraph in two, put the cursor at a point where you'd want to add a paragraph break in the text and either click this button or hit enter key`}
      >
        <Button disabled={isProcessing} onClick={handleSplitParagraph} color="primary">
          <KeyboardReturnOutlinedIcon color="primary" />
        </Button>
      </Tooltip> */}
          {/*  */}

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
          {/* <Tooltip
        title={
          ' Restore timecodes. At the moment for transcript over 1hour it could temporarily freeze the UI for a few seconds'
        }
      >
        <Button
          disabled={isProcessing}
          onClick={async () => {
            try {
              setIsProcessing(true);
              await handleRestoreTimecodes();
              if (handleAnalyticsEvents) {
                // handles if click cancel and doesn't set speaker name
                handleAnalyticsEvents('ste_handle_restore_timecodes_btn', {
                  fn: 'handleRestoreTimecodes',
                });
              }
            } finally {
              setIsProcessing(false);
            }
          }}
          color="primary"
        >
          <CachedOutlinedIcon
            color={'primary'}
            // color={isContentModified ? 'secondary' : 'primary'}
          />
        </Button>
      </Tooltip> */}
          <Tooltip label={REPLACE_WHOLE_TEXT_INSTRUCTION}>
            <Button onClick={handleReplaceText} color="primary">
              <MdImportExport color="primary" />
            </Button>
          </Tooltip>
          {/* <Tooltip title={' Double click on a word to jump to the corresponding point in the media'}>
        <Button disabled={isProcessing} color="primary">
          <InfoOutlined color="primary" />
        </Button>
      </Tooltip> */}
        </>
      )}
      {children}
    </Flex>
  );
}

export default SideBtns;
