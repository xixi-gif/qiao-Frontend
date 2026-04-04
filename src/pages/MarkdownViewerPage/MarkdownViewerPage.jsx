import React, { useState, useEffect, useRef } from 'react';
import { Layout, Typography, Input, Card, Row, Col, Modal, Spin, Empty, Image, Pagination, Button, message, Drawer } from "antd";
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
  const [size, setSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState('resource');
  const chartRef = useRef(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const chartInstanceRef = useRef(null);

  const [aiDrawerVisible, setAiDrawerVisible] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const loadFavoriteIds = async () => {
    try {
      const res = await api.markdownApi.getMyFavoriteIds();
      setFavoriteIds(res.data.ids || []);
    } catch (err) {}
  };

  const loadList = async () => {
    setLoading(true);
    try {
      const skip = (page - 1) * size;
      const res = await api.markdownApi.getList({ skip, limit: size, title: searchKey });
      setTotal(res.data.total);
      setList(res.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadKnowledgeGraph = async () => {
    if (!chartRef.current) return;
    setGraphLoading(true);
    if (chartInstanceRef.current) {
      chartInstanceRef.current.dispose();
      chartInstanceRef.current = null;
    }
    try {
      const res = await api.markdownApi.getKnowledgeGraph();
      let { nodes = [], links = [] } = res.data;
      nodes = nodes.slice(0, 350);
      links = links.slice(0, 350);
      const chart = echarts.init(chartRef.current);
      chartInstanceRef.current = chart;
      const option = {
        tooltip: {
          formatter: (params) => {
            if (params.dataType === 'node') {
              const name = params.data.name || '';
              const summary = params.data.summary || '暂无简介';
              return `<div style="max-width:320px; padding:8px 12px; line-height:1.7; white-space: pre-wrap;"><b>${name}</b><br/>${summary}</div>`;
            }
            return params.data.rel_type;
          },
          backgroundColor: "#fff",
          textStyle: { width: 300 },
          extraCssText: "max-width:320px; white-space: pre-wrap; word-wrap: break-word;"
        },
        legend: [
          {
            data: ['人物', '地点', '建筑', '侨批'],
            top: 10
          }
        ],
        series: [
          {
            type: 'graph',
            layout: 'force',
            roam: true,
            zoom: true,
            nodeScaleRatio: 0.6,
            symbolSize: 18,
            label: {
              show: true,
              fontSize: 11
            },
            force: {
              repulsion: 150,
              edgeLength: 60,
              gravity: 0.1
            },
            data: nodes.map(n => ({
              id: n.entity_id,
              name: n.name,
              category: (n.type_name === 'person' ? 0 : n.type_name === 'hometown' ? 1 : n.type_name === 'house' ? 2 : 3),
              summary: n.summary
            })),
            links: links.map(l => ({
              source: l.start_entity_id,
              target: l.end_entity_id,
              rel_type: l.rel_type
            })),
            categories: [
              { name: '人物', itemStyle: { color: '#ff6b6b' } },
              { name: '地点', itemStyle: { color: '#4ecdc4' } },
              { name: '建筑', itemStyle: { color: '#ffd93d' } },
              { name: '侨批', itemStyle: { color: '#9c65d0' } }
            ]
          }
        ]
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

  const handleAiAsk = async () => {
    if (!aiQuestion.trim()) {
      message.warning('请输入问题');
      return;
    }
    setAiLoading(true);
    setAiAnswer("AI 正在生成回答，请稍候...");
    try {
      const res = await api.qiaoxiangAiApi.ask(aiQuestion);
      if (res.data.code === 200) {
        setAiAnswer(res.data.answer);
      } else {
        setAiAnswer("获取回答失败");
      }
    } catch (err) {
      console.error(err);
      setAiAnswer('请求失败，请检查后端服务是否启动');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, [page, size, searchKey]);

  useEffect(() => {
    loadFavoriteIds();
  }, []);

  useEffect(() => {
    if (viewMode === 'graph') {
      loadKnowledgeGraph();
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, [viewMode]);

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

          <div style={{
            background: '#fff',
            padding: '16px 20px',
            borderRadius: '8px',
            marginBottom: 24,
            display: 'flex',
            gap: '12px'
          }}>
            <Button
              type={viewMode === 'resource' ? 'primary' : 'default'}
              onClick={() => setViewMode('resource')}
            >
              文化资源
            </Button>
            <Button
              type={viewMode === 'graph' ? 'default' : 'default'}
              onClick={() => setViewMode('graph')}
            >
              知识图谱
            </Button>
            <Button
              type={aiDrawerVisible ? 'primary' : 'default'}
              onClick={() => setAiDrawerVisible(true)}
              style={{ fontWeight: 500 }}
            >
              🌍 开启智慧问答模式
            </Button>
          </div>

          {viewMode === 'resource' ? (
            <Spin spinning={loading}>
              {list.length === 0 ? (
                <Empty style={{ marginTop: 60 }} />
              ) : (
                <Row gutter={[20, 20]}>
                  {list.map((item) => {
                    const imgMatch = item.content?.match(/!\[.*?\]\((.*?)\)/);
                    const cover = imgMatch ? imgMatch[1] : null;
                    const isFav = favoriteIds.includes(item.id);
                    return (
                      <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                        <Card hoverable
                          cover={
                            cover ? (
                              <Image src={cover} preview={false} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                            ) : (
                              <div style={{ height: 160, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>无封面图</div>
                            )
                          }
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
                <div ref={chartRef} style={{ width: '100%', height: 700 }} />
              </Spin>
            </Card>
          )}

          {viewMode === 'resource' && (
            <div style={{ textAlign: 'center', marginTop: 30 }}>
              <Pagination
                current={page}
                pageSize={size}
                total={total}
                onChange={setPage}
                onShowSizeChange={(current, pageSize) => {
                  setPage(1);
                  setSize(pageSize);
                }}
                showSizeChanger
                pageSizeOptions={["10","20","50","100"]}
                showTotal={(total) => `共 ${total} 条`}
              />
            </div>
          )}

          <Modal 
            open={visible} 
            title={currentDoc?.title} 
            onCancel={() => setVisible(false)} 
            width={900} 
            footer={null} 
            destroyOnClose
          >
            <div style={{
              fontSize: "14px",
              lineHeight: "1.6",
              maxHeight: "70vh",
              overflow: "auto",
              padding: "10px 14px",
            }}>
              <style>{`
                .wmde-markdown img {
                  max-width: 100% !important;
                  height: auto !important;
                  display: block;
                  margin: 10px 0;
                }
                .wmde-markdown {
                  font-size: 15px !important;
                  line-height: 1.6 !important;
                }
                .wmde-markdown h1 {
                  font-size: 22px !important;
                }
                .wmde-markdown h2 {
                  font-size: 19px !important;
                }
                .wmde-markdown h3 {
                  font-size: 17px !important;
                }
              `}</style>
              <MDEditor.Markdown source={currentDoc?.content} />
            </div>
          </Modal>

          <Drawer
            title="🌍 侨乡智慧问答"
            placement="right"
            width={420}
            open={aiDrawerVisible}
            onClose={() => setAiDrawerVisible(false)}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input.TextArea
                rows={4}
                placeholder="请输入你想了解的侨乡问题，例如：陈慈黉故居有什么故事？"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
              />
              <Button
                type="primary"
                loading={aiLoading}
                onClick={handleAiAsk}
                disabled={!aiQuestion.trim()}
              >
                发送问题
              </Button>

              <div style={{ marginTop: 16, fontWeight: 500 }}>AI 回答：</div>
              <div
                style={{
                  padding: 12,
                  backgroundColor: '#f7f8fa',
                  borderRadius: 8,
                  minHeight: 100,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {aiAnswer || '等待提问...'}
              </div>
            </div>
          </Drawer>

        </div>
      </Content>
    </Layout>
  );
};

export default MarkdownViewerPage;