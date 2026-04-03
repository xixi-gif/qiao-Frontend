import React, { useState, useEffect } from "react";
import { Layout, List, Avatar, Badge, Card, Typography, Button, Input, message } from "antd";
import { StarOutlined, StarFilled, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../public/Nav/nav";
import api from "../../service/api";
import dayjs from "dayjs";

const { Content } = Layout;
const { Title } = Typography;
const { Search } = Input;

const ChatListPage = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState("");
  const currentUserId = 1;
  const userType = "user";

  const fixImg = (url) => url ? "http://127.0.0.1:8090" + url : "";

  const loadConversations = async () => {
    setLoading(true);
    try {
      const res = await api.chatApi.getConversations(currentUserId, userType);
      const convsWithMerchant = await Promise.all(
        res.map(async (conv) => {
          const merchant = await api.projectApi.getMerchantInfo(conv.merchant_id);
          return {
            ...conv,
            merchant_name: merchant.data.shopName,
            merchant_avatar: merchant.data.avatar
          };
        })
      );
      setConversations(convsWithMerchant);
    } catch (err) {
      message.error("加载会话失败");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePin = async (id, e) => {
    e.stopPropagation();
    try {
      await api.chatApi.togglePin(id);
      loadConversations();
    } catch (err) {
      message.error("操作失败");
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const filtered = conversations.filter(item =>
    (item.merchant_name || "").toLowerCase().includes(searchKey.toLowerCase())
  );

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f9f9f9" }}>
      <Navbar />
      <Content style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <Title level={3}>我的会话</Title>
        </div>
        <Search
          placeholder="搜索商家"
          allowClear
          enterButton={<SearchOutlined />}
          style={{ marginBottom: 16 }}
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
        />
        <Card>
          <List
            loading={loading}
            dataSource={filtered}
            renderItem={(item) => (
              <List.Item
                onClick={() => navigate(`/chat/conversation/${item.id}`)}
                style={{ cursor: "pointer" }}
                actions={[
                  <Button
                    type="text"
                    icon={item.is_pinned ? <StarFilled style={{ color: "#faad14" }} /> : <StarOutlined />}
                    onClick={(e) => handleTogglePin(item.id, e)}
                  />
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Badge count={item.unread_count_user} offset={[-5, 5]}>
                      <Avatar size={50} src={fixImg(item.merchant_avatar)} />
                    </Badge>
                  }
                  title={
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>{item.merchant_name || "商家"}</span>
                      <span style={{ fontSize: 12, color: "#999" }}>
                        {dayjs(item.last_message_time).format("MM-DD HH:mm")}
                      </span>
                    </div>
                  }
                  description={<div style={{ color: "#666" }}>{item.last_message || "暂无消息"}</div>}
                />
              </List.Item>
            )}
          />
        </Card>
      </Content>
    </Layout>
  );
};

export default ChatListPage;