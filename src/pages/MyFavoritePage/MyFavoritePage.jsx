import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Row, Col, Modal, Spin, Empty, Image, Button, message, Input } from "antd";
import { StarFilled } from "@ant-design/icons";
import MDEditor from "@uiw/react-md-editor";
import api from "../../service/api";
import Navbar from '../../../public/Nav/nav';

const { Title } = Typography;
const { Content } = Layout;

const MyFavoritePage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [searchKey, setSearchKey] = useState('');

  const loadMyFavorites = async () => {
    setLoading(true);
    try {
      const res = await api.markdownApi.getMyFavorites();
      setList(res.data || []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const unfavorite = async (docId) => {
    try {
      await api.markdownApi.toggleFavorite(docId);
      message.success("已取消收藏");
      loadMyFavorites();
    } catch (err) {
      message.warning("请先登录");
    }
  };

  useEffect(() => {
    loadMyFavorites();
  }, []);

  const filteredList = list.filter(item =>
    item.title?.toLowerCase().includes(searchKey.toLowerCase())
  );

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f9f5f1" }}>
      <Navbar />
      <Content style={{ padding: "24px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Title level={3} style={{ margin: 0, color: "#9C706A" }}>我的收藏资源库</Title>
            <div style={{ display: "flex", gap: 8, width: 400 }}>
              <Input
                placeholder="搜索收藏文档"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                style={{ flex: 1 }}
                size="large"
                allowClear
              />
              <Button
                size="large"
                style={{ backgroundColor: "#9C706A", color: "#fff", borderColor: "#9C706A" }}
              >
                检索
              </Button>
            </div>
          </div>

          <Spin spinning={loading}>
            {filteredList.length === 0 ? (
              <Empty description="暂无收藏" style={{ marginTop: 60 }} />
            ) : (
              <Row gutter={[20, 20]}>
                {filteredList.map((item) => {
                  const imgMatch = item.content?.match(/!\[.*?\]\((.*?)\)/);
                  const cover = imgMatch ? imgMatch[1] : null;
                  return (
                    <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                      <Card
                        hoverable
                        bordered={false}
                        style={{ borderRadius: 12, overflow: "hidden" }}
                        cover={
                          cover ? (
                            <div style={{ height: 160, overflow: "hidden" }}>
                              <Image
                                src={cover}
                                alt="cover"
                                preview={false}
                                style={{ width: "100%", height: 160, objectFit: "cover" }}
                              />
                            </div>
                          ) : (
                            <div style={{ height: 160, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
                              无图
                            </div>
                          )
                        }
                        onClick={() => { setCurrentDoc(item); setVisible(true); }}
                      >
                        <div style={{ position: "absolute", top: 10, right: 10 }}>
                          <Button
                            type="text"
                            icon={<StarFilled style={{ color: "#FFBE45" }} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              unfavorite(item.id);
                            }}
                          />
                        </div>
                        <Card.Meta
                          title={item.title}
                          description={<div style={{ fontSize: 12 }}>{item.created_at?.slice(0, 10)}</div>}
                        />
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}
          </Spin>

          <Modal
            open={visible}
            title={currentDoc?.title}
            onCancel={() => setVisible(false)}
            width={1000}
            footer={null}
          >
            <MDEditor.Markdown source={currentDoc?.content} />
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default MyFavoritePage;