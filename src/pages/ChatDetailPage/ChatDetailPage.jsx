import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Input, Button, Upload, message } from 'antd';
import { SendOutlined, PictureOutlined, PushpinOutlined } from '@ant-design/icons';
import api from '../../service/api';
import dayjs from 'dayjs';
import EmojiPicker from '../../../public/EmojiPicker/EmojiPicker';

const { TextArea } = Input;

const ChatDetail = ({ convId, activeConv, refresh }) => {
  const [msgs, setMsgs] = useState([]);
  const [content, setContent] = useState('');
  const ref = useRef(null);
  const [user, setUser] = useState(null);

  const load = async () => {
    if (!convId) return;
    try {
      const u = JSON.parse(localStorage.getItem('userInfo'));
      if (!u) return;
      setUser(u);
      setMsgs([]);
      const msgRes = await api.chatApi.getMessages(convId);
      setMsgs(msgRes.data || []);
      await api.chatApi.markRead(convId, u.id);
      refresh?.();
    } catch (e) {
      console.error(e);
      message.error('加载失败');
    }
  };

  const handlePin = async () => {
    try {
      await api.chatApi.togglePin(convId);
      refresh();
    } catch (e) {
      message.error('操作失败');
    }
  };

  useEffect(() => {
    if (convId) {
      load();
    } else {
      setMsgs([]);
      setContent('');
    }
  }, [convId]);

  const send = async () => {
    const msg = content || '';
    if (!msg.trim()) return;
    if (!user || !user.id) {
      message.warning('请先登录');
      return;
    }
    try {
      await api.chatApi.sendMessage({
        conversation_id: convId,
        sender_id: user.id,
        content: msg,
        msg_type: 'text'
      });
      setContent('');
      load();
    } catch (e) {
      message.error('发送失败');
    }
  };

  const upload = async (file) => {
    if (!user || !user.id) {
      message.warning('请先登录');
      return false;
    }
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.chatApi.upload(fd);
      await api.chatApi.sendMessage({
        conversation_id: convId,
        sender_id: user.id,
        msg_type: 'image',
        file_url: res.data.url,
        file_name: res.data.name
      });
      load();
    } catch (e) {
      message.error('上传失败');
    }
    return false;
  };

  const onEmoji = (emoji) => {
    setContent(prev => prev + emoji);
  };

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const fix = (u) => u ? `http://127.0.0.1:8090${u}` : null;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#ebebeb' }}>
      <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar src={fix(activeConv?.target_avatar)} />
          <span style={{ fontSize: 16, fontWeight: 500 }}>{activeConv?.target_name || '用户'}</span>
        </div>
        <Button
          type="text"
          icon={<PushpinOutlined />}
          style={{ color: activeConv?.is_pinned ? '#1890ff' : '#999' }}
          onClick={handlePin}
        />
      </div>

      <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
        {msgs.map((m) => {
          const isMe = user && m.sender_id === user.id;
          return (
            <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', width: '100%', marginBottom: 16 }}>
              {!isMe && <Avatar src={fix(activeConv?.target_avatar)} style={{ marginRight: 8, width: 36, height: 36 }} />}
              <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                {m.msg_type === 'text' && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    background: isMe ? '#95e062' : '#fff',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    wordBreak: 'break-word'
                  }}>{m.content}</div>
                )}
                {m.msg_type === 'image' && m.file_url && (
                  <img src={fix(m.file_url)} style={{ width: 200, borderRadius: 12, objectFit: 'cover' }} alt="" />
                )}
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                  {dayjs(m.created_at).format('HH:mm')}
                </div>
              </div>
              {isMe && <Avatar src={fix(user?.avatar)} style={{ marginLeft: 8, width: 36, height: 36 }} />}
            </div>
          );
        })}
        <div ref={ref} />
      </div>

      <div style={{ padding: 10, background: '#fff', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <Upload beforeUpload={upload} fileList={[]} accept="image/*">
          <Button icon={<PictureOutlined />} type="text" />
        </Upload>
        <EmojiPicker onSelect={onEmoji} />
        <TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          autoSize={{ minRows: 1, maxRows: 4 }}
          placeholder="输入消息..."
          style={{ flex: 1, borderRadius: 20, padding: '10px 16px', background: '#f5f5f5', border: 'none' }}
          onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <Button type="primary" icon={<SendOutlined />} onClick={send} style={{ borderRadius: 20 }}>发送</Button>
      </div>
    </div>
  );
};

export default ChatDetail;