import React, { useState, useEffect, useRef } from 'react';
import { Layout, Typography, Input, Card, Row, Col, Modal, Spin, Empty, Image, Pagination, Button, message } from "antd";
import { StarOutlined, StarFilled } from "@ant-design/icons";
import MDEditor from "@uiw/react-md-editor";
import api from "../../service/api";
import Navbar from '../../../public/Nav/nav';
import * as echarts from 'echarts';

const { Title } = Typography;
const { Content } = Layout;
const { Search } = Input;

const MarkdownViewerPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [searchKey, setSearchKey] = useState('');
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(12);
  const [total, setTotal] = useState(0);

  const [viewMode, setViewMode] = useState('resource');
  const chartRef = useRef(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const chartInstanceRef = useRef(null);

  const loadFavoriteIds = async () => {
    try {
      const res = await api.markdownApi.getMyFavoriteIds();
      setFavoriteIds(res.data.ids || []);
    } catch (err) {}
  };

  const loadList = async () => {
    setLoading(true);
    try {
      const res = await api.markdownApi.getList();
      let data = res.data || [];
      data = data.filter(item => !item.is_deleted);
      setTotal(data.length);
      setList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadKnowledgeGraph = async () => {
    if (!chartRef.current) return;
    setGraphLoading(true);
    try {
      const res = await api.markdownApi.getKnowledgeGraph();
      const { nodes, links } = res.data;

      if (chartInstanceRef.current) chartInstanceRef.current.dispose();
      const chart = echarts.init(chartRef.current);
      chartInstanceRef.current = chart;

      const option = {
        backgroundColor: '#fff',
        tooltip: { trigger: 'item' },
        graph: {
          layout: 'force',
          roam: true,
          zoom: true,
          force: { repulsion: 200, edgeLength: 70 },
          nodes: nodes.map(n => ({ id: n.id, name: n.name, category: n.category, symbolSize: 28 })),
          links: links.map(l => ({ source: l.source, target: l.target, name: l.relation })),
          categories: [
            { name: 'person', itemStyle: { color: '#FF6B6B' } },
            { name: 'hometown', itemStyle: { color: '#4ECDC4' } },
            { name: 'house', itemStyle: { color: '#FFE066' } },
            { name: 'remittance', itemStyle: { color: '#9D65C9' } }
          ]
        }
      };
      chart.setOption(option);
      window.addEventListener('resize', () => chart.resize());
    } catch (err) {
      console.error(err);
    } finally {
      setGraphLoading(false);
    }
  };

  const toggleFavorite = async (docId, e) => {
    e.stopPropagation();
    try {
      const res = await api.markdownApi.toggleFavorite(docId);
      if (res.data.action === "favorite") {
        setFavoriteIds([...favoriteIds, docId]);
        message.success("收藏成功");
      } else {
        setFavoriteIds(favoriteIds.filter(id => id !== docId));
        message.success("已取消收藏");
      }
    } catch (err) {
      message.error("操作失败");
    }
  };

  useEffect(() => {
    loadList();
    loadFavoriteIds();
  }, []);

  useEffect(() => {
    if (viewMode === 'graph') loadKnowledgeGraph();
  }, [viewMode]);

  const filteredList = list.filter(item =>
    item.title?.toLowerCase().includes(searchKey.toLowerCase())
  );

  const handleView = (record) => {
    setCurrentDoc(record);
    setVisible(true);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Navbar />
      <Content style={{ padding: "24px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <Title level={3}>📄 文档资源库</Title>

          <Search
            placeholder="搜索文档名称"
            allowClear
            enterButton
            size="large"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            style={{ marginBottom: 20, maxWidth: 500 }}
          />

          <Card style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button type={viewMode === 'resource' ? 'primary' : 'default'} onClick={() => setViewMode('resource')}>
                文化资源
              </Button>
              <Button type={viewMode === 'graph' ? 'primary' : 'default'} onClick={() => setViewMode('graph')}>
                知识图谱
              </Button>
            </div>
          </Card>

          {viewMode === 'resource' ? (
            <Spin spinning={loading}>
              {filteredList.length === 0 ? (
                <Empty style={{ marginTop: 60 }} />
              ) : (
                <Row gutter={[20, 20]}>
                  {filteredList.map((item) => {
                    const imgMatch = item.content?.match(/!\[.*?\]\((.*?)\)/);
                    const cover = imgMatch ? imgMatch[1] : null;
                    const isFav = favoriteIds.includes(item.id);

                    return (
                      <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                        <Card hoverable
                          cover={cover ? <div style={{ height: 160, overflow: 'hidden' }}>
                            <Image src={cover} preview={false} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                          </div> : <div style={{ height: 160, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>无封面图</div>}
                          onClick={() => handleView(item)}
                        >
                          <div style={{ position: 'absolute', top: 10, right: 10 }}>
                            <Button type="text" icon={isFav ? <StarFilled style={{ color: "#FFBE45" }} /> : <StarOutlined />} onClick={(e) => toggleFavorite(item.id, e)} />
                          </div>
                          <Card.Meta title={item.title} description={<div style={{ fontSize: 12, color: '#666' }}>{item.created_at?.slice(0, 10)}</div>} />
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </Spin>
          ) : (
            <Card style={{ padding: 0 }}>
              <Spin spinning={graphLoading}>
                <div ref={chartRef} style={{ width: '100%', height: 600 }} />
              </Spin>
            </Card>
          )}

          {viewMode === 'resource' && (
            <div style={{ textAlign: 'center', marginTop: 30 }}>
              <Pagination current={page} pageSize={size} total={total} onChange={setPage} />
            </div>
          )}

          <Modal open={visible} title={currentDoc?.title} onCancel={() => setVisible(false)} width={1000} footer={null} destroyOnClose>
            <MDEditor.Markdown source={currentDoc?.content} style={{ padding: 10, minHeight: 500 }} />
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default MarkdownViewerPage;