import React from 'react';
import { SmileOutlined } from '@ant-design/icons';
import { Popover, Space } from 'antd';

const emojis = [
  '😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇',
  '🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚',
  '😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥸',
  '🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️',
  '😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡',
  '🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓',
  '🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄',
  '😯','😦','😧','😮','😲','🥱','😴','😷','🤒','🤕',
  '🤢','🤮','🥴','😈','👿','💀','👻','👽','🤖','💩',
  '👍','👎','👏','🙌','🤝','✌️','🤟','🤘','👌','❤️'
];

const EmojiPicker = ({ onSelect }) => {
  const content = (
    <div style={{
      width: 280,
      padding: 10,
      display: 'grid',
      gridTemplateColumns: 'repeat(10, 1fr)',
      gap: '8px',
      maxHeight: 220,
      overflowY: 'auto'
    }}>
      {emojis.map((emoji, idx) => (
        <div
          key={idx}
          onClick={() => onSelect(emoji)}
          style={{
            fontSize: 20,
            cursor: 'pointer',
            textAlign: 'center',
            padding: '4px',
            borderRadius: 4
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );

  return (
    <Popover trigger="click" content={content} placement="topLeft">
      <SmileOutlined style={{ fontSize: 20, cursor: 'pointer', padding: '0 8px' }} />
    </Popover>
  );
};

export default EmojiPicker;