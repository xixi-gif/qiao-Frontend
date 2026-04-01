import React, { useEffect, useState } from "react";
import { Layout, Card, Image, Tag, Descriptions, Button, Typography, Divider, Breadcrumb, List, Avatar, Input, message, Popover } from "antd";
import { ArrowLeftOutlined, EyeOutlined, ShoppingCartOutlined, HomeOutlined, StarOutlined, LikeOutlined, MessageOutlined, SmileOutlined, DeleteOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../public/Nav/nav";
import api from "../../service/api";

const { Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;

const TourDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favCount, setFavCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyId, setReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyToName, setReplyToName] = useState("");
  const [isFav, setIsFav] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [expandedMap, setExpandedMap] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);

  const TARGET_TYPE = "project";

  const EMOJIS = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😶‍🌫️', '😱', '😨', '😰', '😥', '😓', '🤗', '🤩', '🥳', '😎', '🥺', '😇'];

  const fixImg = (url) => {
    if (!url) return "";
    return "http://127.0.0.1:8090" + url;
  };

  const loadCounts = async () => {
    try {
      const fav = await api.interactionApi.getFavoriteCount(TARGET_TYPE, id);
      const like = await api.interactionApi.getLikeCount(TARGET_TYPE, id);
      setFavCount(fav.data.count);
      setLikeCount(like.data.count);
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
        content: commentText,
        parent_id: 0
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
    const isMine = rep.user_id === currentUserId;

    let showContent = rep.is_delete ? "该评论已删除" : rep.content;
    if (!rep.is_delete && replyName) {
      showContent = `回复 @${replyName}: ${rep.content}`;
    }

    return (
      <List.Item key={rep.id} style={{ paddingLeft: 40, marginTop: 8, border: "none" }}>
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <Avatar src={fixImg(rep.avatar)} size={32} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#1677ff", fontWeight: 500, fontSize: 14 }}>{rep.username}</span>
              <span style={{ fontSize: 12, color: "#999" }}>{rep.created_at}</span>
            </div>
            <div style={{ marginTop: 4, color: rep.is_delete ? "#999" : "#333", fontSize: 14 }}>
              {showContent}
            </div>
            <div style={{ marginTop: 4, display: "flex", gap: 8 }}>
              {!rep.is_delete && (
                <Button type="text" size="small" onClick={() => handleReply(rep.id, rep.username)}>回复</Button>
              )}
              {isMine && (
                <Button type="text" danger size="small" onClick={() => handleDeleteComment(rep.id)}>删除</Button>
              )}
            </div>
            {replyId === rep.id && !rep.is_delete && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  <Popover
                    content={
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(10,1fr)", gap: 4 }}>
                        {EMOJIS.map(e => (
                          <Button key={e} type="text" onClick={() => setReplyText(t => t + e)}>{e}</Button>
                        ))}
                      </div>
                    }
                  >
                    <Button type="text" icon={<SmileOutlined />} size="small" />
                  </Popover>
                  <TextArea
                    rows={2}
                    placeholder={`回复 @${replyToName}`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
                <Button size="small" type="primary" onClick={() => submitReply(rep.id)}>发送</Button>
              </div>
            )}
          </div>
        </div>
      </List.Item>
    );
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await api.projectApi.getTourProjectDetail(id);
        setProject(res.data);
        await api.projectApi.addProjectView(id);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    const loadUser = async () => {
      try {
        const u = await api.authApi.getProfile();
        setCurrentUserId(u.data.id);
      } catch (err) {}
    };
    loadData();
    loadUser();
    loadCounts();
    loadUserStatus();
    loadComments();
  }, [id]);

  if (loading)
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Navbar />
        <Content style={{ padding: 24 }}>
          <Card loading style={{ maxWidth: 1000, margin: "0 auto" }} />
        </Content>
      </Layout>
    );

  if (!project)
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Navbar />
        <Content style={{ padding: 24 }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <Title level={4}>项目不存在或未上线</Title>
          </div>
        </Content>
      </Layout>
    );

  const mainComments = comments.filter(c => !c.parent_id);

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f9f9f9" }}>
      <Navbar />
      <Content style={{ padding: "24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <Breadcrumb style={{ marginBottom: 16 }}>
            <Breadcrumb.Item onClick={() => navigate("/tourism/projects")}>
              <HomeOutlined /> 首页
            </Breadcrumb.Item>
            <Breadcrumb.Item>项目详情</Breadcrumb.Item>
          </Breadcrumb>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>返回</Button>
          <Card>
            <Card size="small" style={{ backgroundColor: "#fafafa", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Image width={64} height={64} style={{ borderRadius: "50%" }} src={fixImg(project.merchant?.avatar)} fallback="https://picsum.photos/id/1005/100/100" />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>{project.merchant?.shopName}</div>
                  <div style={{ color: "#999", fontSize: 12 }}>{project.merchant?.shopAddress}</div>
                  <Button type="link" style={{ padding: 0, marginTop: 4 }} onClick={() => navigate(`/merchant/user/${project.merchant_id}`)}>查看主页</Button>
                </div>
              </div>
            </Card>
            <Title level={3}>{project.title}</Title>
            <Divider />
            <Image width="100%" height={400} style={{ objectFit: "cover", borderRadius: 8 }} src={fixImg(project.cover)} fallback="https://picsum.photos/id/1036/800/400" />
            <Divider />
            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
              <Button icon={<StarOutlined />} type={isFav ? "primary" : "default"} onClick={handleFavorite}>收藏 {favCount}</Button>
              <Button icon={<LikeOutlined />} type={isLiked ? "primary" : "default"} onClick={handleLike}>点赞 {likeCount}</Button>
              <Button icon={<MessageOutlined />}>评论 {comments.length}</Button>
            </div>
            <Divider />
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="项目分类">{project.category}</Descriptions.Item>
              <Descriptions.Item label="项目标签">{project.tags && project.tags.split(",").map((t, i) => <Tag key={i}>{t}</Tag>)}</Descriptions.Item>
              <Descriptions.Item label="项目地址">{project.address}</Descriptions.Item>
              <Descriptions.Item label="开始时间">{project.start_time}</Descriptions.Item>
              <Descriptions.Item label="结束时间">{project.end_time}</Descriptions.Item>
              <Descriptions.Item label="项目价格">¥{project.price}</Descriptions.Item>
              <Descriptions.Item label="最大参与人数">{project.max_people}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{project.contact}</Descriptions.Item>
              <Descriptions.Item label="浏览量"><EyeOutlined /> {project.views}</Descriptions.Item>
              <Descriptions.Item label="订单量"><ShoppingCartOutlined /> {project.orders}</Descriptions.Item>
            </Descriptions>
            <Divider />
            <Title level={5}>项目介绍</Title>
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{project.description}</div>
            <Divider />
            <Title level={5}>用户评论</Title>
            <div style={{ marginBottom: 16, display: "flex", gap: 4, alignItems: "flex-start" }}>
              <Popover
                trigger="click"
                placement="bottomLeft"
                content={
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(10,1fr)", gap: 4 }}>
                    {EMOJIS.map(e => (
                      <Button key={e} type="text" onClick={() => setCommentText(t => t + e)}>{e}</Button>
                    ))}
                  </div>
                }
              >
                <Button type="text" icon={<SmileOutlined />} />
              </Popover>
              <TextArea
                rows={4}
                placeholder="写下你的评论..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{ flex: 1 }}
              />
              <Button type="primary" onClick={submitComment}>提交评论</Button>
            </div>

            <List
              dataSource={mainComments}
              renderItem={(item) => {
                const allReplies = getAllChildren(item.id);
                const isExpanded = expandedMap[item.id];
                const showReplies = isExpanded ? allReplies : allReplies.slice(0, 1);
                const hiddenCount = allReplies.length - 1;
                const isMine = item.user_id === currentUserId;

                let showContent = item.is_delete ? "该评论已删除" : item.content;

                return (
                  <List.Item>
                    <div style={{ display: "flex", gap: 12 }}>
                      <Avatar src={fixImg(item.avatar)} size={40} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#1677ff", fontWeight: 500 }}>{item.username}</span>
                          <span style={{ color: "#999" }}>{item.created_at}</span>
                        </div>
                        <div style={{ margin: "4px 0", color: item.is_delete ? "#999" : "#333" }}>
                          {showContent}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          {!item.is_delete && (
                            <Button size="small" type="text" onClick={() => handleReply(item.id, item.username)}>回复</Button>
                          )}
                          {isMine && (
                            <Button size="small" type="text" danger onClick={() => handleDeleteComment(item.id)}>删除</Button>
                          )}
                        </div>

                        {replyId === item.id && !item.is_delete && (
                          <div style={{ marginTop: 8 }}>
                            <div style={{ display: "flex", gap: 4 }}>
                              <Popover
                                content={
                                  <div style={{ display: "grid", gridTemplateColumns: "repeat(10,1fr)", gap: 4 }}>
                                    {EMOJIS.map(e => (
                                      <Button key={e} type="text" onClick={() => setReplyText(t => t + e)}>{e}</Button>
                                    ))}
                                  </div>
                                }
                              >
                                <Button type="text" icon={<SmileOutlined />} size="small" />
                              </Popover>
                              <TextArea
                                rows={2}
                                placeholder={`回复 @${replyToName}`}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                style={{ flex: 1 }}
                              />
                            </div>
                            <Button size="small" type="primary" onClick={() => submitReply(item.id)}>发送</Button>
                          </div>
                        )}

                        {allReplies.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            {showReplies.map(rep => renderReplyItem(rep))}
                            {hiddenCount > 0 && !isExpanded && (
                              <Button type="link" size="small" onClick={() => toggleExpand(item.id)}>展开{hiddenCount}条</Button>
                            )}
                            {isExpanded && hiddenCount > 0 && (
                              <Button type="link" size="small" onClick={() => toggleExpand(item.id)}>收起</Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default TourDetailPage;