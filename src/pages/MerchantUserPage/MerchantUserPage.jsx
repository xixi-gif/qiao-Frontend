import React, { useEffect, useState } from "react";
import { Layout, Card, Image, Typography, Row, Col, Button, Input, message } from "antd";
import { ArrowLeftOutlined, SearchOutlined, MessageOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../public/Nav/nav";
import api from "../../service/api";

const { Content } = Layout;
const { Title } = Typography;

const MerchantUserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState("");

  const fixImg = (url) => url ? "http://127.0.0.1:8090" + url : "";

  const handleContact = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('userInfo'));
      if (!user || !user.id) {
        message.warning("请先登录");
        return;
      }

      const res = await api.chatApi.createConversation(user.id, parseInt(id));
      const conversation = res.data;

      if (conversation?.id) {
        message.success("进入聊天");
        navigate(`/chat/${conversation.id}`);
      } else {
        message.error("未获取到会话ID");
      }

    } catch (err) {
      console.error(err);
      message.error("发起会话失败");
    }
  };

  useEffect(() => {
    setLoading(true);
    api.projectApi.getMerchantInfo(id).then((res) => {
      setUserInfo(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f9f5f1" }}>
      <Navbar />
      <Content style={{ padding: 24 }}>
        <Card loading style={{ maxWidth: 1000, margin: "0 auto" }} />
      </Content>
    </Layout>
  );

  if (!userInfo) return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f9f5f1" }}>
      <Navbar />
      <Content style={{ padding: 24 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <Title level={4}>商家不存在</Title>
        </div>
      </Content>
    </Layout>
  );

  const filteredProjects = (userInfo.projects || []).filter(item =>
    item.title.toLowerCase().includes(searchKey.toLowerCase())
  );

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f9f5f1" }}>
      <Navbar />
      <Content style={{ padding: "24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>

          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
            返回
          </Button>

          <Card style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <Image width={100} height={100} style={{ borderRadius: "50%" }} src={fixImg(userInfo.avatar)}
                fallback="https://picsum.photos/id/1005/100/100" />
              <div>
                <Title level={3} style={{ margin: 0, color: "#9C706A" }}>{userInfo.shopName}</Title>
                <div style={{ color: "#999", marginTop: 8 }}>{userInfo.shopAddress}</div>
                <Button type="primary" icon={<MessageOutlined />} style={{ marginTop: 12, backgroundColor: "#9C706A", borderColor: "#9C706A" }} onClick={handleContact}>
                  联系商家
                </Button>
              </div>
            </div>
          </Card>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0, color: "#9C706A" }}>TA发布的项目</Title>
            <div style={{ display: "flex", alignItems: "center", gap: 8, width: 260 }}>
              <Input
                placeholder="搜索项目"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                style={{ flex: 1 }}
                allowClear
              />
              <Button icon={<SearchOutlined />} style={{ backgroundColor: "#9C706A", borderColor: "#9C706A", color: "#fff" }} />
            </div>
          </div>

          <Row gutter={[24, 24]}>
            {filteredProjects.map((item) => (
              <Col xs={24} sm={12} lg={8} key={item.id}>
                <Card hoverable style={{ borderRadius: 12 }} bodyStyle={{ padding: 16 }}
                  onClick={() => navigate(`/tour/detail/${item.id}`)}>
                  <Image height={220} width="100%" style={{ objectFit: "cover", borderRadius: 8 }}
                    src={fixImg(item.cover)} fallback="https://picsum.photos/id/1036/400/300" />
                  <Title level={5} style={{ marginTop: 12, marginBottom: 8, color: "#9C706A" }}>{item.title}</Title>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#999" }}>
                    <span>¥{item.price}/人</span>
                    <span>{userInfo.shopName}</span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default MerchantUserPage;