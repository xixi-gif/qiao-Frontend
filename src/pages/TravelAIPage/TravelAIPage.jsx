import React, { useState, useEffect, useRef } from 'react';
import {
  Layout, Card, Form, Input, InputNumber, Select, List, Typography,
  Divider, Alert, Space, Tag, Button, Spin, Empty,
  Statistic, Row, Col, Avatar, Badge, Descriptions, Tabs
} from 'antd';
// 只使用基础图标，避免版本兼容问题
import {
  EnvironmentOutlined, DatabaseOutlined,
  CompassOutlined, ThunderboltOutlined, LineChartOutlined,
  GlobalOutlined, MenuOutlined
} from '@ant-design/icons';
import api from '../../service/api';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const TravelAIPage = () => {
  // ========== 状态管理 ==========
  const [themes, setThemes] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedThemeInfo, setSelectedThemeInfo] = useState(null);
  const [selectedStartId, setSelectedStartId] = useState('');
  const [planResult, setPlanResult] = useState(null);
  const [loadingThemes, setLoadingThemes] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);
  const [error, setError] = useState('');
  const [form] = Form.useForm();
  
  // 地图相关ref
  const mapRef = useRef(null); // 地图容器ref
  const bmapInstance = useRef(null); // 百度地图实例ref
  const markersRef = useRef([]); // 标记点实例ref
  const polylineRef = useRef(null); // 路线实例ref

  // ========== 生命周期 ==========
  useEffect(() => {
    loadThemes();
  }, []);

  useEffect(() => {
    setResources([]);
    setPlanResult(null);
    setSelectedStartId('');
    setSelectedThemeInfo(null);
    form.setFieldsValue({ start_uid: '' });

    if (selectedTheme) {
      const info = themes.find(t => t.theme_id === selectedTheme);
      setSelectedThemeInfo(info);
      loadResources(selectedTheme);
    }
  }, [selectedTheme, themes, form]);

  // 初始化地图
  useEffect(() => {
    if (!mapRef.current) return;
    
    // 确保百度地图SDK已加载
    if (window.BMapGL) {
      // 创建地图实例
      const map = new window.BMapGL.Map(mapRef.current);
      // 设置中心点（汕头）
      const centerPoint = new window.BMapGL.Point(116.7, 23.4);
      map.centerAndZoom(centerPoint, 12);
      // 开启鼠标滚轮缩放
      map.enableScrollWheelZoom(true);
      bmapInstance.current = map;
    } else {
      setError('地图加载失败，请检查网络或百度地图AK配置');
    }

    // 清理函数
    return () => {
      if (bmapInstance.current) {
        bmapInstance.current.clearOverlays();
        bmapInstance.current = null;
      }
    };
  }, []);

  // 资源变化时更新地图标记
  useEffect(() => {
    if (!bmapInstance.current || !resources.length) return;
    
    // 清除旧标记
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => {
        bmapInstance.current.removeOverlay(marker);
      });
      markersRef.current = [];
    }

    // 添加新标记
    resources.forEach(resource => {
      if (!resource.longitude || !resource.latitude) return;
      
      const point = new window.BMapGL.Point(resource.longitude, resource.latitude);
      // 创建标记
      const marker = new window.BMapGL.Marker(point);
      // 设置标记图标（区分起点/普通点）
      const iconUrl = resource.uid === selectedStartId 
        ? 'https://api.map.baidu.com/images/markers/red.png' 
        : 'https://api.map.baidu.com/images/markers/blue.png';
      marker.setIcon(new window.BMapGL.Icon(iconUrl, new window.BMapGL.Size(24, 36)));
      
      // 添加信息窗口
      const infoWindow = new window.BMapGL.InfoWindow(`
        <div style="width:280px;padding:5px;">
          <p><strong>名称：</strong>${resource.name}</p>
          <p><strong>地区：</strong>${resource.district}</p>
          <p><strong>类型：</strong>${resource.type}</p>
          <p><strong>开放时间：</strong>${resource.opening_hours}</p>
          <p><strong>活动时长：</strong>${resource.activity_duration}</p>
          <p style="font-size:12px;color:#666;">${resource.description?.substring(0, 80)}…</p>
        </div>
      `);
      
      // 点击标记显示信息窗口
      marker.addEventListener('click', () => {
        bmapInstance.current.openInfoWindow(infoWindow, point);
      });
      
      // 添加到地图
      bmapInstance.current.addOverlay(marker);
      markersRef.current.push(marker);
    });

    // 调整地图视野以显示所有标记
    const points = resources.map(r => new window.BMapGL.Point(r.longitude, r.latitude));
    const viewport = new window.BMapGL.Viewport();
    viewport.setPoints(points);
    viewport.setMap(bmapInstance.current);
    bmapInstance.current.setViewport(viewport.getBounds());
  }, [resources, selectedStartId]);

  // 路径规划结果变化时更新路线
  useEffect(() => {
    if (!bmapInstance.current || !planResult?.route || planResult.route.length === 0) {
      // 清除旧路线
      if (polylineRef.current) {
        bmapInstance.current.removeOverlay(polylineRef.current);
        polylineRef.current = null;
      }
      return;
    }

    // 清除旧路线
    if (polylineRef.current) {
      bmapInstance.current.removeOverlay(polylineRef.current);
    }

    // 创建路线点数组
    const routePoints = planResult.route.map(item => 
      new window.BMapGL.Point(item.longitude, item.latitude)
    );

    // 创建折线
    const polyline = new window.BMapGL.Polyline(routePoints, {
      strokeColor: '#1890ff', // 蓝色
      strokeWeight: 4,        // 线宽
      strokeOpacity: 0.8      // 透明度
    });

    // 添加路线到地图
    bmapInstance.current.addOverlay(polyline);
    polylineRef.current = polyline;

    // 更新标记（添加序号）
    planResult.route.forEach((item, index) => {
      const marker = markersRef.current.find(m => {
        const position = m.getPosition();
        return position.lng === item.longitude && position.lat === item.latitude;
      });
      
      if (marker) {
        // 设置带序号的图标
        const iconUrl = index === 0 
          ? 'https://api.map.baidu.com/images/markers/marker_red.png' 
          : `https://api.map.baidu.com/images/markers/marker_blue_${index + 1}.png`;
        marker.setIcon(new window.BMapGL.Icon(iconUrl, new window.BMapGL.Size(24, 36)));
      }
    });

    // 调整视野到路线范围
    const viewport = new window.BMapGL.Viewport();
    viewport.setPoints(routePoints);
    viewport.setMap(bmapInstance.current);
    bmapInstance.current.setViewport(viewport.getBounds());
  }, [planResult]);

  // ========== 方法 ==========
  const loadThemes = async () => {
    setLoadingThemes(true);
    setError('');
    try {
      const res = await api.plannerApi.getAllThemes();
      const valid = (res.data || []).filter(t => t?.theme_id && t?.name);
      setThemes(valid);
    } catch (err) {
      setError('加载主题失败：' + (err.message || '网络异常'));
    } finally {
      setLoadingThemes(false);
    }
  };

  const loadResources = async (themeId) => {
    if (!themeId) return;
    setLoadingResources(true);
    setError('');
    try {
      // 调用你的真实API
      const res = await api.plannerApi.getResourcesByTheme(themeId);
      setResources(res.data || []);
    } catch (err) {
      setError('加载资源失败：' + (err.response?.data?.detail || err.message || '网络异常'));
      setResources([]);
    } finally {
      setLoadingResources(false);
    }
  };

  const handlePlan = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedTheme || !values.start_uid) {
        setError('请选择主题和起点ID');
        return;
      }
      setError('');
      
      // 调用你的路径规划API
      const res = await api.plannerApi.planRoute({
        theme_id: selectedTheme,
        start_uid: values.start_uid,
        num_points: values.num_points || 6
      });
      
      if (res.data?.status === 'success') {
        setPlanResult(res.data);
      } else {
        setError('规划失败：返回数据异常');
        setPlanResult(null);
      }
    } catch (err) {
      setError('规划失败：' + (err.response?.data?.detail || err.message || '参数错误'));
      setPlanResult(null);
    }
  };

  const handleSelectStart = (uid) => {
    setSelectedStartId(uid);
    form.setFieldsValue({ start_uid: uid });
  };

  // ========== 渲染 ==========
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px' }}>
        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
          智能研学路径规划系统
        </Title>
      </Header>

      <Content style={{ padding: 24 }}>
        {/* 错误提示 */}
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError('')}
            style={{ marginBottom: 16 }}
          />
        )}

        {/* 主题选择 */}
        <Card title={<Space><DatabaseOutlined />研学主题选择</Space>} style={{ marginBottom: 16 }}>
          <Space size="large">
            <Select
              placeholder="请选择研学主题"
              value={selectedTheme}
              onChange={setSelectedTheme}
              style={{ width: 300 }}
              loading={loadingThemes}
              showSearch
              allowClear
            >
              {themes.map(theme => (
                <Option key={theme.theme_id} value={theme.theme_id}>
                  {theme.name}
                </Option>
              ))}
            </Select>
            <Button onClick={loadThemes} loading={loadingThemes} icon={<DatabaseOutlined />}>
              刷新主题
            </Button>
          </Space>

          {selectedThemeInfo && (
            <Card style={{ marginTop: 16, borderLeft: '4px solid #1890ff' }}>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="主题名称">{selectedThemeInfo.name}</Descriptions.Item>
                <Descriptions.Item label="研学目标" span={2}>
                  <Paragraph style={{ margin: 0 }}>{selectedThemeInfo.goal}</Paragraph>
                </Descriptions.Item>
                <Descriptions.Item label="建议时长">{selectedThemeInfo.duration}</Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </Card>

        {/* 资源展示（地图+列表） */}
        <Card title={<Space><EnvironmentOutlined />主题资源</Space>} style={{ marginBottom: 16 }}>
          <Tabs defaultActiveKey="map" size="large">
            {/* 地图视图 */}
            <TabPane tab={<Space><GlobalOutlined />地图视图</Space>} key="map">
              <Spin spinning={loadingResources}>
                {resources.length > 0 ? (
                  <div 
                    ref={mapRef}
                    style={{ width: '100%', height: 600, borderRadius: 8, overflow: 'hidden' }}
                  />
                ) : (
                  <Empty 
                    description={selectedTheme ? '暂无资源数据' : '请先选择研学主题'} 
                    style={{ padding: '60px 0' }}
                  />
                )}
              </Spin>
            </TabPane>

            {/* 列表视图 */}
            <TabPane tab={<Space><MenuOutlined />列表视图</Space>} key="list">
              <Spin spinning={loadingResources}>
                {resources.length > 0 ? (
                  <List
                    grid={{ gutter: 16, column: 4, xs: 1, sm: 2, md: 3, lg: 4 }}
                    dataSource={resources}
                    renderItem={item => (
                      <List.Item key={item.uid}>
                        <Card
                          hoverable
                          onClick={() => handleSelectStart(item.uid)}
                          bordered={item.uid === selectedStartId}
                          style={{
                            borderColor: item.uid === selectedStartId ? '#1890ff' : '#d9d9d9',
                            cursor: 'pointer'
                          }}
                        >
                          <Card.Meta
                            avatar={<Avatar icon={<EnvironmentOutlined />} />}
                            title={
                              <Space>
                                <Text strong>{item.name}</Text>
                                {item.uid === selectedStartId && <Tag color="primary">已选起点</Tag>}
                              </Space>
                            }
                            description={
                              <>
                                <Text type="secondary">ID: {item.uid}</Text><br />
                                <Text type="secondary">区域: {item.district}</Text><br />
                                <Text type="secondary">类型: {item.type}</Text>
                              </>
                            }
                          />
                        </Card>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty 
                    description={selectedTheme ? '暂无资源数据' : '请先选择研学主题'} 
                    style={{ padding: '60px 0' }}
                  />
                )}
              </Spin>
            </TabPane>
          </Tabs>
        </Card>

        {/* 路径规划参数 */}
        <Card title={<Space><CompassOutlined />路径规划参数</Space>} style={{ marginBottom: 16 }}>
          <Form form={form} layout="vertical" initialValues={{ num_points: 6 }} style={{ maxWidth: 500 }}>
            <Form.Item 
              name="start_uid" 
              label="起点ID" 
              rules={[{ required: true, message: '请选择/输入起点ID' }]}
            >
              <Input 
                placeholder="点击上方资源卡片选择起点" 
                prefix={<CompassOutlined />} 
                disabled={loadingResources || loadingThemes}
              />
            </Form.Item>
            <Form.Item 
              name="num_points" 
              label="规划点数" 
              rules={[{ required: true, message: '请输入3-10之间的数字' }]}
            >
              <InputNumber 
                min={3} 
                max={10} 
                style={{ width: '100%' }} 
                disabled={loadingResources || loadingThemes}
                placeholder="3-10"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                onClick={handlePlan}
                loading={loadingResources || loadingThemes}
                disabled={!selectedTheme || resources.length === 0}
                icon={<ThunderboltOutlined />}
                size="large"
                block
              >
                生成最优路径
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* 规划结果 */}
        {planResult && (
          <Card title={<Space><LineChartOutlined />路径规划结果</Space>}>
            <Row gutter={16} style={{ marginBottom: 20 }}>
              <Col xs={12} sm={6}>
                <Statistic title="主题名称" value={planResult.theme_name || '未知'} />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic title="总距离(km)" value={(planResult.total_distance || 0).toFixed(2)} />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic title="途经点数" value={planResult.point_count || 0} />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic title="算法类型" value={planResult.algorithm_used || 'TSP'} />
              </Col>
            </Row>

            <Divider>路径详情</Divider>
            <List
              dataSource={planResult.route || []}
              renderItem={(item, index) => (
                <List.Item
                  key={item.uid || `route_${index}`}
                  style={{ background: '#f9f9f9', marginBottom: 8, borderRadius: 4 }}
                >
                  <Badge count={index === 0 ? '起点' : index + 1} size="small">
                    <Avatar icon={<EnvironmentOutlined />} />
                  </Badge>
                  <div style={{ marginLeft: 16 }}>
                    <Text strong>{item.name}</Text>
                    <Tag style={{ marginLeft: 8 }}>{item.type}</Tag>
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary">ID: {item.uid} | 区域: {item.district || '未知'}</Text>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        )}
      </Content>

      <Footer style={{ textAlign: 'center', background: '#fff' }}>
        智能研学路径规划系统 ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default TravelAIPage;