import React, { useEffect, useState } from "react";
import { Layout, Row, Col, Card, Image, Tag, Typography, Input, Button, Tabs, message } from "antd";
import { EyeOutlined, SearchOutlined, UserOutlined, CalendarOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../public/Nav/nav";
import api from "../../service/api";

const { Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

const TourismProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);

  const fixImg = (url) => {
    if (!url) return "";
    return "http://127.0.0.1:8090" + url;
  };

  const fetchProjects = () => {
    setLoading(true);
    api.projectApi.getActiveProjects()
      .then((res) => {
        setProjects(res.data);
        setLoading(false);
      })
      .catch(() => {
        message.error("项目加载失败");
        setLoading(false);
      });
  };

  const fetchCheckins = () => {
    setCheckinLoading(true);
    api.projectApi.getCheckinWall()
      .then((res) => {
        setCheckins(res.data);
        setCheckinLoading(false);
      })
      .catch(() => {
        message.error("打卡加载失败");
        setCheckinLoading(false);
      });
  };

  useEffect(() => {
    fetchProjects();
    fetchCheckins();
  }, []);

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f9f9f9" }}>
      <Navbar />
      <Content style={{ padding: "24px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0 }}>优质文旅项目</Title>
            <Input placeholder="搜索项目" style={{ width: 300 }} prefix={<SearchOutlined />} />
          </div>

          <Tabs defaultActiveKey="1" style={{ marginBottom: 20 }}>
            <TabPane tab="文旅项目" key="1">
              <Row gutter={[20, 20]}>
                {projects.map((item) => (
                  <Col xs={24} sm={12} lg={6} key={item.id}>
                    <Card hoverable style={{ borderRadius: 10 }} bodyStyle={{ padding: 16 }} loading={loading}>
                      <Image height={180} width="100%" style={{ objectFit: "cover", borderRadius: 6 }} src={fixImg(item.cover)} fallback="https://picsum.photos/id/1036/400/300" />
                      <Title level={5} style={{ marginTop: 12, marginBottom: 6 }}>{item.title}</Title>
                      <div style={{ marginBottom: 8 }}>
                        {item.tags && item.tags.split(",").slice(0, 2).map((t, i) => <Tag key={i} size="small">{t}</Tag>)}
                      </div>
                      <div style={{ color: "#666", fontSize: 12, marginBottom: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.description ? item.description.slice(0, 30) + "..." : ""}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#999" }}>
                        <span>¥{item.price}/人</span>
                        <span><EyeOutlined /> {item.views}</span>
                      </div>
                      <Button type="primary" block size="small" style={{ marginTop: 12 }} onClick={() => navigate(`/tour/detail/${item.id}`)}>查看详情</Button>
                    </Card>
                  </Col>
                ))}
              </Row>
            </TabPane>

            <TabPane tab="游客打卡墙" key="2">
              <Row gutter={[20, 20]}>
                {checkins.map((item) => (
                  <Col xs={24} sm={12} lg={6} key={item.id}>
                    <Card hoverable style={{ borderRadius: 10 }} bodyStyle={{ padding: 16 }} loading={checkinLoading}>
                      <Image height={180} width="100%" style={{ objectFit: "cover", borderRadius: 6 }} src={fixImg(item.image)} fallback="https://picsum.photos/id/1036/400/300" />
                      <Title level={5} style={{ marginTop: 12, marginBottom: 6 }}>{item.title}</Title>
                      <div style={{ marginBottom: 8 }}>
                        {item.tags?.split(",").map((t, i) => <Tag key={i} size="small" color="blue">{t}</Tag>)}
                      </div>
                      <div style={{ color: "#666", fontSize: 12, marginBottom: 10, minHeight: 30 }}>
                        {item.content?.length > 30 ? item.content.slice(0, 30) + "..." : item.content}
                      </div>
                      <div style={{ fontSize: 12, color: "#999", marginBottom: 8 }}>
                        <UserOutlined /> {item.nickname} · <CalendarOutlined /> {item.create_time?.slice(0, 10)}
                      </div>
                      <Button type="primary" block size="small" style={{ marginTop: 12 }} onClick={() => navigate(`/checkin/detail/${item.id}`)}>查看打卡</Button>
                    </Card>
                  </Col>
                ))}
              </Row>
            </TabPane>
          </Tabs>
        </div>
      </Content>
    </Layout>
  );
};

export default TourismProjectsPage;