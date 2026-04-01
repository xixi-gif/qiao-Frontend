import React, { useState, useEffect } from 'react';
import { Layout, Button, Avatar, Tabs, Tag, Badge, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../../service/api';
import Navbar from '../../../public/Nav/nav';

const { Content } = Layout;
const { TabPane } = Tabs;

const UserComments = () => {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const baseURL = 'http://localhost:8090';

  useEffect(() => {
    api.authApi.getUserComments().then(res => {
      setComments(res.data || []);
      setLoadingComments(false);
    }).catch(() => setLoadingComments(false));
  }, []);

  useEffect(() => {
    api.authApi.getMyMessages().then(res => {
      setMessages(res.data || []);
      setLoadingMessages(false);
    }).catch(() => setLoadingMessages(false));
  }, []);

  const readMessage = (id) => {
    api.authApi.readMessage(id).then(() => {
      setMessages(messages.map(m =>
        m.msg_id === id ? { ...m, is_read: true } : m
      ));
    });
  };

  const readAll = () => {
    api.authApi.readAllMessages().then(() => {
      setMessages(messages.map(m => ({ ...m, is_read: true })));
    });
  };

  const formatTime = (t) => new Date(t).toLocaleString('zh-CN');

  const unreadCount = messages.filter(m => !m.is_read).length;

  const toProject = (id) => {
    if (id && id > 0) {
      navigate(`/tour/detail/${id}`);
    } else {
      message.info('该项目已不存在');
    }
  };

  const toCommentTarget = (targetType, targetId) => {
    if (!targetId || targetId <= 0) {
      message.info('该内容已不存在');
      return;
    }
    if (targetType === 'project') {
      navigate(`/tour/detail/${targetId}`);
    } else if (targetType === 'checkin') {
      navigate(`/checkin/detail/${targetId}`);
    } else {
      message.info('无法跳转');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Navbar />
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="我的评论" key="1">
              {loadingComments ? (
                <div style={{ padding: 40, textAlign: 'center' }}><Spin /></div>
              ) : comments.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>暂无评论</div>
              ) : (
                comments.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => toCommentTarget(item.target_type, item.project_id)}
                    style={{ padding: '14px 0', cursor: 'pointer', borderBottom: idx < comments.length - 1 ? '1px solid #f0f0f0' : 'none' }}
                  >
                    <div style={{ display: 'flex', gap: 12 }}>
                      <Avatar size={40}>我</Avatar>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>我</div>
                        <div style={{ fontSize: 12, color: '#999' }}>评论了：{item.title}</div>
                        <div style={{ marginTop: 8, lineHeight: 1.5, color: item.is_delete ? '#999' : '#333' }}>{item.content}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#999' }}>
                          <span>{formatTime(item.created_at)}</span>
                          {item.status === 'pending' && <Tag color="processing">审核中</Tag>}
                          {item.status === 'approved' && <Tag color="success">已通过</Tag>}
                          {item.status === 'rejected' && <Tag color="error">已驳回</Tag>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabPane>

            <TabPane
              tab={<Badge dot={unreadCount > 0} offset={[5, 0]}>我的消息</Badge>}
              key="2"
            >
              {unreadCount > 0 && (
                <Button type="text" size="small" onClick={readAll} style={{ marginBottom: 10 }}>
                  全部标为已读
                </Button>
              )}

              {loadingMessages ? (
                <div style={{ padding: 40, textAlign: 'center' }}><Spin /></div>
              ) : messages.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>暂无消息</div>
              ) : (
                messages.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => { toProject(item.project?.id); readMessage(item.msg_id); }}
                    style={{ padding: '14px 0', cursor: 'pointer', borderBottom: idx < messages.length - 1 ? '1px solid #f0f0f0' : 'none' }}
                  >
                    <div style={{ display: 'flex', gap: 12 }}>
                      <Badge dot={!item.is_read} offset={[-5, 5]}>
                        <Avatar src={item.reply_user?.avatar ? `${baseURL}${item.reply_user.avatar}` : null} size={40}>
                          {item.reply_user?.username?.[0] || '用'}
                        </Avatar>
                      </Badge>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{item.reply_user?.username || '用户'}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>回复了你的评论</div>
                        <div style={{ marginTop: 8, lineHeight: 1.5, background:'#f7f8fa', padding:8, borderRadius:6 }}>
                          <div style={{fontSize:12, color:'#666'}}>我的评论：<span style={{ color: item.my_comment === '评论已删除' ? '#999' : '#666' }}>{item.my_comment}</span></div>
                          <div style={{marginTop:4}}>对方回复：{item.his_reply}</div>
                        </div>
                        <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                          来自：{item.project?.title || '项目已删除'}
                        </div>
                        <div style={{ fontSize: 12, color: '#ccc', marginTop: 4 }}>
                          {formatTime(item.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabPane>
          </Tabs>
        </div>
      </Content>
    </Layout>
  );
};

export default UserComments;