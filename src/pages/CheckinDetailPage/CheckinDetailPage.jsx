import React, { useState, useEffect } from 'react';
import { Layout, Card, Image, Tag, Descriptions, Button, message, Space, Typography, Divider, Avatar, List, Input } from 'antd';
import { ArrowLeftOutlined, LikeOutlined, StarOutlined, MessageOutlined, UserOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../service/api';
import Navbar from '../../../public/Nav/nav';
import EmojiPicker from '../../../public/EmojiPicker/EmojiPicker';

const { Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;

const CheckinDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [checkin, setCheckin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [replyId, setReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyToName, setReplyToName] = useState('');
  const [expandedMap, setExpandedMap] = useState({});
  const [exists, setExists] = useState(true);

  const TARGET_TYPE = 'checkin';

  const fixImg = (url) => {
    if (!url) return '';
    return `http://127.0.0.1:8090${url}`;
  };

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.projectApi.getCheckinDetail(id);
      if (!res.data || res.data.is_deleted) {
        setExists(false);
        return;
      }
      setCheckin(res.data);
    } catch (err) {
      setExists(false);
    } finally {
      setLoading(false);
    }
  };

  const loadCounts = async () => {
    try {
      const favRes = await api.interactionApi.getFavoriteCount(TARGET_TYPE, id);
      const likeRes = await api.interactionApi.getLikeCount(TARGET_TYPE, id);
      setFavCount(favRes.data.count);
      setLikeCount(likeRes.data.count);
    } catch (err) {}
  };

  const loadUserStatus = async () => {
    try {
      const favRes = await api.interactionApi.getUserFavoriteStatus(TARGET_TYPE, id);
      const likeRes = await api.interactionApi.getUserLikeStatus(TARGET_TYPE, id);
      setIsFav(favRes.data.is_favorite);
      setIsLiked(likeRes.data.is_liked);
    } catch (err) {}
  };

  const loadUser = async () => {
    try {
      const u = await api.authApi.getProfile();
      setCurrentUserId(u.data.id);
    } catch (err) {}
  };

  const loadComments = async () => {
    try {
      const res = await api.interactionApi.getComments(TARGET_TYPE, id);
      setComments(res.data);
    } catch (err) {}
  };

  const handleFavorite = async () => {
    try {
      const res = await api.interactionApi.createFavorite({
        target_type: TARGET_TYPE,
        target_id: parseInt(id)
      });
      setIsFav(res.data.is_favorite);
      setFavCount(prev => res.data.is_favorite ? prev + 1 : prev - 1);
      message.success(res.data.is_favorite ? "收藏成功" : "取消收藏");
    } catch (err) {
      message.warning("请先登录");
    }
  };

  const handleLike = async () => {
    try {
      const res = await api.interactionApi.createLike({
        target_type: TARGET_TYPE,
        target_id: parseInt(id)
      });
      setIsLiked(res.data.is_liked);
      setLikeCount(prev => res.data.is_liked ? prev + 1 : prev - 1);
      message.success(res.data.is_liked ? "点赞成功" : "取消点赞");
    } catch (err) {
      message.warning("请先登录");
    }
  };

  const submitComment = async () => {
    if (!commentText) {
      message.warning("请输入评论内容");
      return;
    }
    try {
      await api.interactionApi.createComment({
        target_type: TARGET_TYPE,
        target_id: parseInt(id),
        content: commentText
      });
      message.success("评论成功，待审核");
      setCommentText("");
      loadComments();
    } catch (err) {
      message.warning("请先登录");
    }
  };

  const submitReply = async (cid) => {
    if (!replyText) {
      message.warning("请输入回复内容");
      return;
    }
    try {
      await api.interactionApi.createComment({
        target_type: TARGET_TYPE,
        target_id: parseInt(id),
        parent_id: cid,
        content: replyText
      });
      message.success("回复成功，待审核");
      setReplyId(null);
      setReplyText("");
      setReplyToName("");
      loadComments();
    } catch (err) {
      message.warning("请先登录");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.interactionApi.deleteComment(commentId);
      message.success("删除成功");
      loadComments();
    } catch (err) {
      message.warning("删除失败");
    }
  };

  const handleReply = (cid, name) => {
    setReplyId(cid);
    setReplyToName(name);
    setReplyText("");
  };

  const toggleExpand = (mainId) => {
    setExpandedMap(prev => ({
      ...prev,
      [mainId]: !prev[mainId]
    }));
  };

  const getAllChildren = (parentId) => {
    const children = comments.filter(c => c.parent_id === parentId);
    let all = [...children];
    children.forEach(c => {
      all = [...all, ...getAllChildren(c.id)];
    });
    return all;
  };

  const renderReplyItem = (rep) => {
    const parentComment = comments.find(c => c.id === rep.parent_id);
    const replyName = parentComment?.username;
    const displayContent = rep.is_delete ? "该评论已删除" : (replyName ? `回复 @${replyName}: ${rep.content}` : rep.content);
    const isMine = rep.user_id === currentUserId;
    return (
      <List.Item key={rep.id} style={{ paddingLeft: 40, marginTop: 8, border: "none" }}>
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <Avatar src={rep.avatar ? fixImg(rep.avatar) : undefined} size={32} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#1677ff", fontWeight: 500, fontSize: 14 }}>{rep.username}</span>
              <span style={{ fontSize: 12, color: "#999" }}>{rep.created_at}</span>
            </div>
            <div style={{ marginTop: 4, color: rep.is_delete ? "#999" : "#333", fontSize: 14 }}>{displayContent}</div>
            <div style={{ marginTop: 4, display: "flex", gap: 8 }}>
              {!rep.is_delete && <Button type="text" size="small" onClick={() => handleReply(rep.id, rep.username)} style={{ padding: 0, fontSize: 12 }}>回复</Button>}
              {isMine && <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteComment(rep.id)} style={{ padding: 0, fontSize: 12 }}>删除</Button>}
            </div>
            {replyId === rep.id && !rep.is_delete && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
                  <EmojiPicker onSelect={(e) => setReplyText(t => t + e)} size="small" />
                  <TextArea
                    rows={3}
                    size="small"
                    placeholder={`回复 @${replyToName}`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
                <Button size="small" type="primary" onClick={() => submitReply(rep.id)} style={{ marginTop: 4 }}>发送</Button>
              </div>
            )}
          </div>
        </div>
      </List.Item>
    );
  };

  const contactAuthor = async () => {
    if (!currentUserId) {
      message.warning("请先登录");
      return;
    }
    if (currentUserId === checkin.user_id) {
      message.info("这是你自己的打卡");
      return;
    }
    try {
      const res = await api.chatApi.createConversation(currentUserId, checkin.user_id);
      message.success("正在进入聊天...");
      navigate(`/chat/${res.data.id}`);
    } catch (e) {
      console.error(e);
      message.error("无法联系作者");
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetail();
      loadCounts();
      loadUserStatus();
      loadUser();
      loadComments();
    }
  }, [id]);

  const mainComments = comments.filter(c => !c.parent_id);

  if (!exists) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
        <Navbar />
        <Content style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#999' }}>
            <DeleteOutlined style={{ fontSize: 60, marginBottom: 16 }} />
            <Title level={5}>打卡已被删除</Title>
            <Button onClick={() => navigate(-1)} style={{ marginTop: 16 }}>返回</Button>
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Navbar />
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>返回</Button>
          <Card loading={loading}>
            {checkin && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  <Avatar size={48} src={fixImg(checkin.avatar)} icon={<UserOutlined />} />
                  <div style={{ marginLeft: 12 }}>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>{checkin.username}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{checkin.create_time}</div>
                  </div>
                  <Button
                    type="primary"
                    size="small"
                    icon={<MessageOutlined />}
                    onClick={contactAuthor}
                    style={{ marginLeft: 'auto' }}
                  >
                    联系作者
                  </Button>
                </div>

                <Title level={4}>{checkin.title}</Title>
                <Image width="100%" style={{ maxHeight: 500, objectFit: 'cover', borderRadius: 8 }} src={fixImg(checkin.image)} fallback="https://via.placeholder.com/800x500" />
                
                <Divider />

                <Descriptions bordered column={1} size="middle">
                  <Descriptions.Item label="打卡内容">{checkin.content}</Descriptions.Item>
                  <Descriptions.Item label="打卡标签">
                    {checkin.tags?.split?.(',').map((t, i) => <Tag key={i}>{t}</Tag>) || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="浏览量">
                    <EyeOutlined /> {checkin.view_count}
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Space size="large">
                  <Button type={isFav ? "primary" : "default"} icon={<StarOutlined />} onClick={handleFavorite}>
                    收藏 {favCount}
                  </Button>
                  <Button type={isLiked ? "primary" : "primary"} icon={<LikeOutlined />} onClick={handleLike}>
                    点赞 {likeCount}
                  </Button>
                  <Button icon={<MessageOutlined />}>评论 {comments.length}</Button>
                </Space>

                <Divider />

                <Title level={5}>评论区</Title>

                <div style={{ marginBottom: 16, display: 'flex', gap: 4, alignItems: 'flex-start' }}>
                  <EmojiPicker onSelect={(e) => setCommentText(t => t + e)} />
                  <TextArea
                    rows={4}
                    placeholder="写下你的评论..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <Button type="primary" style={{ marginTop: 4 }} onClick={submitComment}>提交评论</Button>
                </div>

                <List
                  dataSource={mainComments}
                  renderItem={(item) => {
                    const allReplies = getAllChildren(item.id);
                    const isExpanded = expandedMap[item.id];
                    const showReplies = isExpanded ? allReplies : allReplies.slice(0, 1);
                    const hiddenCount = allReplies.length - 1;
                    const isMine = item.user_id === currentUserId;
                    return (
                      <List.Item>
                        <div style={{ display: "flex", gap: 12, width: "100%" }}>
                          <Avatar src={item.avatar ? fixImg(item.avatar) : undefined} size={40} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ color: item.is_delete ? "#999" : "#1677ff", fontWeight: 500, fontSize: 15 }}>{item.username}</span>
                              <span style={{ fontSize: 12, color: "#999" }}>{item.created_at}</span>
                            </div>
                            <div style={{ marginTop: 6, color: item.is_delete ? "#bbb" : "#333", fontSize: 14 }}>
                              {item.is_delete ? "该评论已删除" : item.content}
                            </div>
                            <div style={{ marginTop: 4, display: "flex", gap: 8 }}>
                              {!item.is_delete && <Button type="text" size="small" onClick={() => handleReply(item.id, item.username)} style={{ padding: 0, fontSize: 12 }}>回复</Button>}
                              {isMine && <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteComment(item.id)} style={{ padding: 0, fontSize: 12 }}>删除</Button>}
                            </div>
                            {replyId === item.id && !item.is_delete && (
                              <div style={{ marginTop: 8 }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
                                  <EmojiPicker onSelect={(e) => setReplyText(t => t + e)} size="small" />
                                  <TextArea
                                    rows={3}
                                    size="small"
                                    placeholder={`回复 @${replyToName}`}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    style={{ flex: 1 }}
                                  />
                                </div>
                                <Button size="small" type="primary" onClick={() => submitReply(item.id)} style={{ marginTop: 4 }}>发送</Button>
                              </div>
                            )}
                            {allReplies.length > 0 && (
                              <>
                                {showReplies.map(rep => renderReplyItem(rep))}
                                {hiddenCount > 0 && !isExpanded && (
                                  <div style={{ paddingLeft: 40, marginTop: 4 }}>
                                    <Button type="link" size="small" onClick={() => toggleExpand(item.id)}>展开{hiddenCount}条回复</Button>
                                  </div>
                                )}
                                {isExpanded && hiddenCount > 0 && (
                                  <div style={{ paddingLeft: 40, marginTop: 4 }}>
                                    <Button type="link" size="small" onClick={() => toggleExpand(item.id)}>收起</Button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </List.Item>
                    );
                  }}
                />
              </>
            )}
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default CheckinDetail;