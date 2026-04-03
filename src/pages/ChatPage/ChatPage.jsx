import React, { useState, useEffect } from 'react';
import { Layout, List, Avatar, Badge, Input, message } from 'antd';
import { SearchOutlined, MessageOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../../public/Nav/nav';
import api from '../../service/api';
import dayjs from 'dayjs';
import ChatDetail from '../ChatDetailPage/ChatDetailPage';

const { Content } = Layout;
const { Search } = Input;

const ChatPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [convs, setConvs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeConv, setActiveConv] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const loadList = async () => {
    try {
      setLoading(true);
      const u = JSON.parse(localStorage.getItem('userInfo'));
      if (!u || !u.id) {
        setConvs([]);
        return;
      }
      setUser(u);

      const res = await api.chatApi.getConversations(u.id);
      const convsData = Array.isArray(res.data) ? res.data : [];
      setConvs(convsData);

      if (id) {
        const target = convsData.find(x => x.id === Number(id));
        if (target) {
          setActiveId(Number(id));
          setActiveConv(target);
        }
      } else if (convsData.length > 0) {
        setActiveId(convsData[0].id);
        setActiveConv(convsData[0]);
      } else {
        setActiveId(null);
        setActiveConv(null);
      }
    } catch (e) {
      console.error('加载失败', e);
      setConvs([]);
      message.error('加载会话失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, [id]);

  const handleSelect = (item) => {
    setActiveId(item.id);
    setActiveConv(item);
    navigate(`/chat/${item.id}`);
  };

  const fixImg = (u) => u ? `http://127.0.0.1:8090${u}` : '';

  return (
    <Layout style={{ height: '100vh', background: '#f9f9f9' }}>
      <Navbar />
      <Content style={{ display: 'flex', padding: 0, margin: 0 }}>
        <div style={{ width: 320, borderRight: '1px solid #e5e5e5', background: '#fff', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
          <div style={{ padding: 16 }}>
            <Search placeholder="搜索会话" allowClear enterButton={<SearchOutlined />} />
          </div>
          <List
            loading={loading}
            dataSource={convs}
            style={{ height: 'calc(100vh - 120px)', overflowY: 'auto' }}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                onClick={() => handleSelect(item)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0',
                  background: activeId === item.id ? '#e6f7ff' : '#fff'
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Badge count={item.unread_count_user}>
                      <Avatar src={fixImg(item.target_avatar)} />
                    </Badge>
                  }
                  title={item.target_name}
                  description={<span style={{ color: '#999', fontSize: 12 }}>{item.last_message || '暂无消息'}</span>}
                />
                <div style={{ fontSize: 11, color: '#999' }}>
                  {dayjs(item.last_message_time).format('HH:mm')}
                </div>
              </List.Item>
            )}
          />
        </div>

        <div style={{ flex: 1, height: 'calc(100vh - 64px)' }}>
          {activeId && activeConv ? (
            <ChatDetail
              key={activeId}
              convId={activeId}
              activeConv={activeConv}
              refresh={loadList}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <MessageOutlined style={{ fontSize: 48, color: '#ddd' }} />
                <div style={{ marginTop: 16, color: '#999' }}>请选择会话</div>
              </div>
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default ChatPage;