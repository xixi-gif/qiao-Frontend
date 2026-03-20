import React, { useState, useEffect, useRef } from 'react';
import {
  Layout, Card, Form, Input, InputNumber, Select, List, Typography,
  Divider, Alert, Space, Button, Spin, Statistic, Row, Col, Badge, Tabs
} from 'antd';
import {
  EnvironmentOutlined, DatabaseOutlined,
  CompassOutlined
} from '@ant-design/icons';
import api from '../../service/api';
import Navbar from '../../../public/Nav/nav';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const TravelAIPage = () => {
  const [themes, setThemes] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedThemeInfo, setSelectedThemeInfo] = useState(null);
  const [selectedStartId, setSelectedStartId] = useState('');
  const [planResult, setPlanResult] = useState(null);
  const [loadingThemes, setLoadingThemes] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);
  // 新增：规划路径加载状态
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [error, setError] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [form] = Form.useForm();

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const infoWindowsRef = useRef([]);
  const planMarkersRef = useRef([]);

  useEffect(() => {
    loadThemes();
    loadBMapGL();
  }, []);

  const loadBMapGL = () => {
    if (window.BMapGL) {
      setMapLoaded(true);
      initMap();
      return;
    }
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://api.map.baidu.com/api?v=3.0&type=webgl&ak=nnf62zOAv8Ga0xyR1RNCpglbojvhsb4x';
    script.onload = () => {
      setMapLoaded(true);
      initMap();
    };
    script.onerror = () => {
      setError('百度地图加载失败，请检查AK是否为浏览器端类型');
    };
    document.head.appendChild(script);
  };

  const initMap = () => {
    if (!mapRef.current || !window.BMapGL) return;
    try {
      const map = new window.BMapGL.Map(mapRef.current);
      const centerPoint = new window.BMapGL.Point(116.699777, 23.359611);
      map.centerAndZoom(centerPoint, 12);
      map.enableScrollWheelZoom(true);
      map.addControl(new window.BMapGL.NavigationControl3D());
      map.addEventListener('tilesloaded', () => {
        setMapLoaded(true);
      });
      mapInstance.current = map;
    } catch (err) {
      setError('地图初始化失败：' + err.message);
    }
  };

  useEffect(() => {
    setResources([]);
    setPlanResult(null);
    setSelectedStartId('');
    form.setFieldsValue({ start_uid: '' });
    if (selectedTheme) {
      const info = themes.find(t => t.theme_id === selectedTheme);
      setSelectedThemeInfo(info);
      loadResources(selectedTheme);
    }
  }, [selectedTheme, themes, form]);

  const closeAllInfoWindows = () => {
    infoWindowsRef.current.forEach(win => {
      try {
        win.close();
      } catch (e) {}
    });
    infoWindowsRef.current = [];
  };

  useEffect(() => {
    if (!mapInstance.current || !resources.length || !mapLoaded) return;
    
    markersRef.current.forEach(m => {
      try { mapInstance.current.removeOverlay(m); } catch (e) {}
    });
    closeAllInfoWindows();
    markersRef.current = [];

    resources.forEach(r => {
      // 兼容两种经纬度字段
      const lon = r.longitude || r.lon_parsed;
      const lat = r.latitude || r.lat_parsed;
      if (!lon || !lat) return;
      
      const point = new window.BMapGL.Point(lon, lat);
      const marker = new window.BMapGL.Marker(point);
      
      const iconSize = new window.BMapGL.Size(24, 36);
      const redIcon = new window.BMapGL.Icon('https://img.icons8.com/color/48/ff0000/marker.png', iconSize);
      const blueIcon = new window.BMapGL.Icon('https://img.icons8.com/color/48/0000ff/marker.png', iconSize);
      marker.setIcon(r.uid === selectedStartId ? redIcon : blueIcon);

      const safeName = (r.name || '未知名称').replace(/[<>]/g, '');
      const safeHours = r.opening_hours || '未知时间';
      const safeDesc = (r.description || '无简介').substring(0, 150);
      const safeRelated = r.related_resources || '无关联资源';

      const infoWindowContent = `
        <div style="padding: 12px; width: 350px; max-height: 280px; overflow-y: auto; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <h4 style="margin: 0 0 10px 0; color: #1890ff; font-size: 16px; font-weight: 600;">${safeName}</h4>
          <div style="margin-bottom: 8px; font-size: 14px; color: #666;">
            <strong>开放时间：</strong>${safeHours}
          </div>
          <div style="margin-bottom: 8px; font-size: 14px; line-height: 1.5; color: #333;">
            <strong>简介：</strong>${safeDesc}
          </div>
          <div style="margin-bottom: 12px; font-size: 14px; color: #666;">
            <strong>关联路径：</strong>${safeRelated}
          </div>
          <button 
            onclick="document.getElementById('select-start-${r.uid}').click()"
            style="width: 100%; padding: 6px 0; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; transition: background 0.2s;"
            onmouseover="this.style.background='#40a9ff'"
            onmouseout="this.style.background='#1890ff'"
          >
            设为起点
          </button>
        </div>`;

      const infoWindow = new window.BMapGL.InfoWindow(infoWindowContent, {
        width: 370,
        height: 300,
        offset: new window.BMapGL.Size(0, -40)
      });
      infoWindowsRef.current.push(infoWindow);

      marker.addEventListener('mouseover', () => {
        closeAllInfoWindows();
        mapInstance.current.openInfoWindow(infoWindow, point);
      });
      
      marker.addEventListener('mouseout', () => {
        setTimeout(() => {
          const activeHover = document.querySelector(`[onclick*="select-start-${r.uid}"]:hover`);
          if (!activeHover) {
            infoWindow.close();
          }
        }, 200);
      });
      
      marker.addEventListener('click', () => {
        handleSelectStart(r.uid);
        infoWindow.close();
      });

      const hiddenBtn = document.createElement('button');
      hiddenBtn.id = `select-start-${r.uid}`;
      hiddenBtn.style.display = 'none';
      hiddenBtn.onclick = () => handleSelectStart(r.uid);
      document.body.appendChild(hiddenBtn);

      mapInstance.current.addOverlay(marker);
      markersRef.current.push(marker);
    });

    if (markersRef.current.length > 0) {
      const points = markersRef.current.map(m => m.getPosition());
      mapInstance.current.setViewport(points);
    }
  }, [resources, selectedStartId, mapLoaded]);

  // 修复：使用 lon_parsed/lat_parsed 展示规划点
  useEffect(() => {
    if (!mapInstance.current || !planResult?.route || !mapLoaded) {
      if (polylineRef.current) {
        try { mapInstance.current.removeOverlay(polylineRef.current); } catch (e) {}
        polylineRef.current = null;
      }
      planMarkersRef.current.forEach(m => {
        try { mapInstance.current.removeOverlay(m); } catch (e) {}
      });
      planMarkersRef.current = [];
      return;
    }

    if (polylineRef.current) mapInstance.current.removeOverlay(polylineRef.current);
    planMarkersRef.current.forEach(m => {
      try { mapInstance.current.removeOverlay(m); } catch (e) {}
    });
    planMarkersRef.current = [];

    // 1. 绘制规划路线（使用 lon_parsed/lat_parsed）
    const routePoints = planResult.route.map(p => new window.BMapGL.Point(p.lon_parsed, p.lat_parsed));
    const polyline = new window.BMapGL.Polyline(routePoints, {
      strokeColor: '#1890ff',
      strokeWeight: 4,
      strokeOpacity: 0.8
    });
    mapInstance.current.addOverlay(polyline);
    polylineRef.current = polyline;

    // 2. 为每个规划点添加绿色标记+数字序号
    planResult.route.forEach((item, index) => {
      if (!item.lon_parsed || !item.lat_parsed) return;
      
      const point = new window.BMapGL.Point(item.lon_parsed, item.lat_parsed);
      const iconSize = new window.BMapGL.Size(24, 36);
      const greenIcon = new window.BMapGL.Icon('https://img.icons8.com/color/48/00ff00/marker.png', iconSize);
      const marker = new window.BMapGL.Marker(point);
      marker.setIcon(greenIcon);

      // 添加数字标签
      const label = new window.BMapGL.Label(`${index + 1}`, {
        position: point,
        offset: new window.BMapGL.Size(10, -10)
      });
      label.setStyle({
        color: '#fff',
        backgroundColor: '#1890ff',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        lineHeight: '20px',
        textAlign: 'center',
        fontSize: '12px',
        border: 'none'
      });

      // 点击规划点设为起点
      marker.addEventListener('click', () => {
        handleSelectStart(item.uid);
      });

      // 添加到地图
      mapInstance.current.addOverlay(marker);
      mapInstance.current.addOverlay(label);
      
      // 保存引用
      planMarkersRef.current.push(marker);
      planMarkersRef.current.push(label);
    });

    // 调整地图视野
    mapInstance.current.setViewport(routePoints);
  }, [planResult, mapLoaded]);

  const loadThemes = async () => {
    setLoadingThemes(true);
    try {
      const res = await api.plannerApi.getAllThemes();
      setThemes(res.data || []);
    } catch (err) {
      setError('加载主题失败');
    } finally {
      setLoadingThemes(false);
    }
  };

  const loadResources = async (themeId) => {
    setLoadingResources(true);
    try {
      const res = await api.plannerApi.getResourcesByTheme(themeId);
      setResources(res.data || []);
    } catch (err) {
      setError('加载资源失败');
      setResources([]);
    } finally {
      setLoadingResources(false);
    }
  };

  // 新增：添加加载动画
  const handlePlan = async () => {
    try {
      const values = await form.validateFields();
      setLoadingPlan(true); // 开始加载
      setError('');
      
      const res = await api.plannerApi.planRoute({
        theme_id: selectedTheme,
        start_uid: values.start_uid,
        num_points: values.num_points
      });
      
      setPlanResult(res.data);
    } catch (err) {
      setError('规划失败：' + (err.message || '未知错误'));
    } finally {
      setLoadingPlan(false); // 结束加载
    }
  };

  const handleSelectStart = (uid) => {
    setSelectedStartId(uid);
    form.setFieldsValue({ start_uid: uid });
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Navbar />

      <Content style={{ padding: 24 }}>
        {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 16 }} />}

        <Card title={<Space><DatabaseOutlined />研学主题</Space>} style={{ marginBottom: 16 }}>
          <Space>
            <Select
              placeholder="选择主题"
              value={selectedTheme}
              onChange={setSelectedTheme}
              style={{ width: 300 }}
              loading={loadingThemes}
            >
              {themes.map(t => (
                <Option key={t.theme_id} value={t.theme_id}>{t.name}</Option>
              ))}
            </Select>
            <Button onClick={loadThemes} loading={loadingThemes}>刷新</Button>
          </Space>
        </Card>

        <Card title={<Space><EnvironmentOutlined />资源地图</Space>} style={{ marginBottom: 16 }}>
          <Tabs defaultActiveKey="map">
            <TabPane tab="地图视图" key="map">
              <Spin spinning={loadingResources || !mapLoaded || loadingPlan}>
                <div ref={mapRef} style={{ width: '100%', height: 600, borderRadius: 8 }} />
              </Spin>
            </TabPane>
            <TabPane tab="列表视图" key="list">
              <Spin spinning={loadingResources}>
                <List grid={{ gutter: 16, column: 4 }} dataSource={resources} renderItem={item => (
                  <List.Item>
                    <Card hoverable onClick={() => handleSelectStart(item.uid)}>
                      <Card.Meta
                        avatar={<EnvironmentOutlined />}
                        title={item.name}
                        description={`${item.district} | ${item.type}`}
                      />
                    </Card>
                  </List.Item>
                )} />
              </Spin>
            </TabPane>
          </Tabs>
        </Card>

        <Card title={<Space><CompassOutlined />路径规划</Space>} style={{ marginBottom: 16 }}>
          <Form form={form} layout="vertical" initialValues={{ num_points: 6 }}>
            <Form.Item name="start_uid" label="起点ID" rules={[{ required: true }]}>
              <Input placeholder="点击地图或列表选择起点" value={selectedStartId} readOnly />
            </Form.Item>
            <Form.Item name="num_points" label="规划点数">
              <InputNumber min={3} max={10} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item>
              {/* 按钮添加加载动画 */}
              <Button type="primary" onClick={handlePlan} block loading={loadingPlan}>
                生成最优路径
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* 规划结果也添加加载动画 */}
        {loadingPlan ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" tip="正在生成最优路径..." />
          </div>
        ) : planResult ? (
          <Card title="规划结果">
            <Row gutter={16}>
              <Col span={6}><Statistic title="总距离" value={planResult.total_distance} suffix="km" /></Col>
              <Col span={6}><Statistic title="点数" value={planResult.point_count} /></Col>
            </Row>
            <Divider />
            <List dataSource={planResult.route} renderItem={(item, i) => (
              <List.Item>
                <Badge count={i + 1} />
                <div style={{ marginLeft: 16 }}>
                  <Text strong>{item.name}</Text>
                  <div>{item.district} | {item.type}</div>
                </div>
              </List.Item>
            )} />
          </Card>
        ) : null}
      </Content>

      <Footer style={{ textAlign: 'center' }}>
        智能研学路径规划系统 ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default TravelAIPage;