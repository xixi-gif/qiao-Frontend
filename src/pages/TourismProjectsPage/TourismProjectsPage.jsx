import React, { useEffect, useState, useRef } from "react";
import { Layout, Row, Col, Card, Image, Tag, Typography, Input, Button, Tabs, message, Spin } from "antd";
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
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("1");

  const [skip, setSkip] = useState(0);
  const limit = 12;
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef(null);

  const fixImg = (url) => {
    if (!url) return "";
    return "http://127.0.0.1:8090" + url;
  };

  const fetchProjects = (keyword = "") => {
    setLoading(true);
    api.projectApi.getActiveProjects({ title: keyword })
      .then((res) => {
        setProjects(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        message.error("项目加载失败");
        setLoading(false);
      });
  };

  const fetchCheckins = (reset = false) => {
    if (checkinLoading) return;
    if (!hasMore && !reset) return;

    const currentSkip = reset ? 0 : skip;
    setCheckinLoading(true);

    api.projectApi.getCheckinWall({
      skip: currentSkip,
      limit: limit,
      title: searchText,
    }).then((res) => {
      const list = res.data || [];
      const newList = reset ? list : [...checkins, ...list];

      setCheckins(newList);
      setSkip(currentSkip + limit);
      setHasMore(list.length === limit);
      setCheckinLoading(false);
    }).catch(() => {
      message.error("加载失败");
      setCheckinLoading(false);
    });
  };

  useEffect(() => {
    if (activeTab === "1") {
      fetchProjects(searchText);
    } else {
      fetchCheckins(true);
    }
  }, [searchText, activeTab]);

  useEffect(() => {
    fetchProjects();
    fetchCheckins(true);
  }, []);

  useEffect(() => {
    if (activeTab !== "2") return;
    const handleScroll = () => {
      if (!loadMoreRef.current) return;
      const rect = loadMoreRef.current.getBoundingClientRect();
      if (rect.top <= window.innerHeight + 200 && hasMore && !checkinLoading) {
        fetchCheckins();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [checkins, hasMore, checkinLoading, activeTab]);

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f9f5f1" }}>
      <Navbar />
      <Content style={{ padding: "24px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ flex: 1, marginRight: 16 }}>
              <TabPane tab="文旅项目" key="1" />
              <TabPane tab="游客打卡墙" key="2" />
            </Tabs>
            <Input
              placeholder="搜索项目/打卡"
              style={{ width: 300 }}
              prefix={<SearchOutlined style={{ color: "#9C706A" }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          {activeTab === "1" && (
            <Row gutter={[20, 20]}>
              {projects.map((item) => (
                <Col xs={24} sm={12} lg={6} key={item.id}>
                  <Card hoverable style={{ borderRadius: 10 }} bodyStyle={{ padding: 16 }} loading={loading}>
                    <Image height={180} width="100%" style={{ objectFit: "cover", borderRadius: 6 }} src={fixImg(item.cover)} fallback="https://picsum.photos/id/1036/400/300" />
                    <Title level={5} style={{ marginTop: 12, marginBottom: 6, color:"#9C706A" }}>{item.title}</Title>
                    <div style={{ marginBottom: 8 }}>
                      {item.tags && item.tags.split(",").slice(0, 2).map((t, i) => <Tag key={i} size="small" color="#d4a59a">{t}</Tag>)}
                    </div>
                    <div style={{ color: "#7d5c58", fontSize: 12, marginBottom: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.description ? item.description.slice(0, 30) + "..." : ""}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#b99a94" }}>
                      <span>¥{item.price}/人</span>
                      <span><EyeOutlined /> {item.views}</span>
                    </div>
                    <Button type="primary" block size="small" style={{ marginTop: 12, backgroundColor: "#9C706A", borderColor: "#9C706A" }} onClick={() => navigate(`/tour/detail/${item.id}`)}>查看详情</Button>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {activeTab === "2" && (
            <>
              <Row gutter={[20, 20]}>
                {checkins.map((item) => (
                  <Col xs={24} sm={12} lg={6} key={item.id}>
                    <Card hoverable style={{ borderRadius: 10 }} bodyStyle={{ padding: 16 }}>
                      <Image height={180} width="100%" style={{ objectFit: "cover", borderRadius: 6 }} src={fixImg(item.image)} fallback="https://picsum.photos/id/1036/400/300" />
                      <Title level={5} style={{ marginTop: 12, marginBottom: 6, color:"#9C706A" }}>{item.title}</Title>
                      <div style={{ marginBottom: 8 }}>
                        {item.tags?.split(",").map((t, i) => <Tag key={i} size="small" color="#d4a59a">{t}</Tag>)}
                      </div>
                      <div style={{ color: "#7d5c58", fontSize: 12, marginBottom: 10, minHeight: 30 }}>
                        {item.content?.length > 30 ? item.content.slice(0, 30) + "..." : item.content}
                      </div>
                      <div style={{ fontSize: 12, color: "#b99a94", marginBottom: 8 }}>
                        <UserOutlined /> {item.username} · <CalendarOutlined /> {item.create_time?.slice(0, 10)}
                      </div>
                      <Button type="primary" block size="small" style={{ marginTop: 12, backgroundColor: "#9C706A", borderColor: "#9C706A" }} onClick={() => navigate(`/checkin/detail/${item.id}`)}>查看打卡</Button>
                    </Card>
                  </Col>
                ))}
              </Row>

              <div ref={loadMoreRef} style={{ textAlign: "center", padding: "20px" }}>
                {checkinLoading && <Spin size="small" />}
                {!hasMore && checkins.length > 0 && <p style={{ color: "#999" }}>没有更多了</p>}
              </div>
            </>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default TourismProjectsPage;