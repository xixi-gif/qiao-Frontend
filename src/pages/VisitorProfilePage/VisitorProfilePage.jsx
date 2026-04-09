import React, { useState, useEffect, useRef } from 'react';
import { Layout, Card, Avatar, Form, Input, Button, Space, message, Typography, Row, Col, Image, Upload, Tag } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, PhoneOutlined, UploadOutlined, LogoutOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../service/api';
import Navbar from '../../../public/Nav/nav';

const { Content } = Layout;
const { Title } = Typography;

const VisitorProfile = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [editable, setEditable] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const isFirstLoad = useRef(true);
  const isUserInfoFetched = useRef(false);

  const [favorites, setFavorites] = useState([]);
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const fixImg = (url) => {
    if(!url) return 'https://picsum.photos/id/1036/400/300';
    if(url.startsWith('http')) return url;
    return 'http://127.0.0.1:8090'+url;
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUserInfo(null);
    message.success('退出登录成功');
    navigate('/login');
  };

  const fetchUserInteractions = async () => {
    if(!token)return;
    setListLoading(true);
    try {
      const [favRes, likeRes, commentRes, checkinRes] = await Promise.allSettled([
        api.authApi.getUserFavorites(),
        api.authApi.getUserLikes(),
        api.authApi.getUserComments(),
        api.projectApi.getMyCheckins(),
      ]);
      setFavorites(favRes.value?.data||[]);
      setLikes(likeRes.value?.data||[]);
      setComments(commentRes.value?.data||[]);
      setCheckins(checkinRes.value?.data||[]);
    } catch (err) {
      console.error(err);
    } finally {
      setListLoading(false);
    }
  };
  useEffect(() => {
    const handleStorageChange = (e) => {
      if(e.key==='accessToken')setToken(e.newValue);
    };
    window.addEventListener('storage',handleStorageChange);
    return ()=>window.removeEventListener('storage',handleStorageChange);
  },[]);

  useEffect(() => {
    if(token)fetchUserInteractions();
  },[token]);

  useEffect(() => {
    if(!token){
      if(!isFirstLoad.current)message.warning('请先登录'),navigate('/login');
      return;
    }
    if(isUserInfoFetched.current)return;
    const fetchUserDetail = async () => {
      setLoading(true);
      try {
        const res = await api.authApi.getProfile();
        const userData = res.data;
        setUserInfo(userData);
        form.setFieldsValue({username:userData.username||'',phone:userData.phone||''});
        isUserInfoFetched.current = true;
      } catch (error) {
        const local = JSON.parse(local.getItem('userInfo')||'{}');
        setUserInfo(local);
        if(error.response?.status===401)handleLogout();
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetail();
  },[token,navigate]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await api.authApi.updateProfile(values);
      message.success('保存成功');
      setEditable(false);
      const res = await api.authApi.getProfile();
      setUserInfo(res.data);
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    const isImg = file.type.startsWith('image/');
    const isLt2M = file.size/1024/1024<2;
    if(!isImg){message.error('仅支持图片');return false;}
    if(!isLt2M){message.error('图片小于2MB');return false;}
    setAvatarLoading(true);
    const formData = new FormData();
    formData.append('file',file);
    try {
      const res = await api.authApi.uploadAvatar(formData);
      setUserInfo(prev=>({...prev,avatar:res.data.data.avatar}));
      message.success('上传成功');
    } catch (err) {
      message.error('上传失败');
    } finally {
      setAvatarLoading(false);
    }
    return false;
  };

  const avatarProps = userInfo?.avatar
    ?{src:fixImg(userInfo.avatar),fallback:<UserOutlined/>}
    :{icon:<UserOutlined/>};

  const getStatusTag = (status) => {
    switch(status){
      case 'pending':return <Tag color="orange">待审核</Tag>;
      case 'approved':return <Tag color="green">已通过</Tag>;
      case 'rejected':return <Tag color="red">已驳回</Tag>;
      default:return <Tag color="default">未知</Tag>;
    }
  };

  return (
    <Layout style={{minHeight:'100vh',backgroundColor:'#f9f5f1'}}>
      <Navbar/>
      <Content style={{padding:'24px'}}>
        <div style={{maxWidth:1000,margin:'0 auto'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
            <Title level={2} style={{margin:0,color:'#9C706A'}}>访客个人中心</Title>
            <Button icon={<LogoutOutlined/>} danger onClick={handleLogout}>退出登录</Button>
          </div>

          <Card
            title="访客基本信息"
            loading={loading}
            bordered={false}
            style={{marginBottom:24,borderRadius:12,boxShadow:'0 1px 8px rgba(0,0,0,0.06)'}}
            extra={
              <Button
                icon={editable?<SaveOutlined/>:<EditOutlined/>}
                onClick={editable?handleSave:()=>setEditable(true)}
                loading={loading}
                style={{backgroundColor:editable?'#9C706A':'',borderColor:editable?'#9C706A':'',color:editable?'#fff':''}}
              >{editable?'保存信息':'编辑信息'}</Button>
            }
          >
            <Row gutter={[24,24]} align="middle">
              <Col xs={24} md={6} style={{textAlign:'center'}}>
                <Avatar {...avatarProps} size={120} style={{marginBottom:16}}/>
                <div>
                  <Upload showUploadList={false} beforeUpload={handleUpload} disabled={!editable}>
                    <Button size="small" icon={<UploadOutlined/>} loading={avatarLoading} disabled={!editable}>更换头像</Button>
                  </Upload>
                </div>
              </Col>
              <Col xs={24} md={18}>
                <Form form={form} layout="vertical" disabled={!editable}>
                  <Space direction="vertical" size="large" style={{width:'100%'}}>
                    <Form.Item name="username" label="昵称" rules={[{required:true,message:'请输入昵称'}]}>
                      <Input prefix={<UserOutlined/>} placeholder="请输入您的昵称"/>
                    </Form.Item>
                    <Form.Item name="phone" label="手机号码" rules={[{required:true},{pattern:/^1[3-9]\d{9}$/,message:'格式错误'}]}>
                      <Input prefix={<PhoneOutlined/>} placeholder="手机号码"/>
                    </Form.Item>
                  </Space>
                </Form>
              </Col>
            </Row>
          </Card>

          <Card 
            title="我的打卡" 
            bordered={false}
            style={{marginBottom:16,borderRadius:12,boxShadow:'0 1px 8px rgba(0,0,0,0.06)'}} 
            extra={
              <div style={{display:'flex',gap:8}}>
                <Button onClick={()=>navigate('/user/checkins')}>查看更多</Button>
                <Button onClick={()=>navigate('/user/checkin/add')} style={{backgroundColor:'#9C706A',borderColor:'#9C706A',color:'#fff'}} icon={<PlusOutlined/>}>添加打卡</Button>
              </div>
            }
          >
            {listLoading?<Card loading/>:checkins.length>0?(
              <Row gutter={[12,12]}>
                {checkins.slice(0,3).map(item=>(
                  <Col xs={8} key={item.id}>
                    <Card hoverable bordered={false} style={{borderRadius:8}} bodyStyle={{padding:10}}>
                      <Image height={120} src={fixImg(item.image)}/>
                      <div style={{fontSize:13,marginTop:8,fontWeight:500}}>{item.title}</div>
                      <div style={{marginTop:4}}>{getStatusTag(item.status)}</div>
                      <div style={{fontSize:12,color:'#999'}}>{item.create_time}</div>
                    </Card>
                  </Col>
                ))}
              </Row>
            ):<Typography.Text type="secondary">暂无打卡</Typography.Text>}
          </Card>

          <Card 
            title="我的收藏" 
            bordered={false}
            style={{marginBottom:16,borderRadius:12,boxShadow:'0 1px 8px rgba(0,0,0,0.06)'}} 
            extra={<Button onClick={()=>navigate('/user/favorites')}>查看更多</Button>}
          >
            {listLoading?<Card loading/>:favorites.length>0?(
              <Row gutter={[12,12]}>
                {favorites.slice(0,3).map(item=>(
                  <Col xs={8} sm={8} key={item.project_id}>
                    <Card hoverable bordered={false} style={{borderRadius:8,height:'100%'}} bodyStyle={{padding:10}}>
                      <Image height={130} width="100%" style={{objectFit:'cover'}} src={fixImg(item.cover)}/>
                      <div style={{fontSize:13,marginTop:8,fontWeight:500}}>{item.title}</div>
                    </Card>
                  </Col>
                ))}
              </Row>
            ):<Typography.Text type="secondary">暂无收藏</Typography.Text>}
          </Card>

          <Card 
            title="我的点赞" 
            bordered={false}
            style={{marginBottom:16,borderRadius:12,boxShadow:'0 1px 8px rgba(0,0,0,0.06)'}} 
            extra={<Button onClick={()=>navigate('/user/likes')}>查看更多</Button>}
          >
            {listLoading?<Card loading/>:likes.length>0?(
              <Row gutter={[12,12]}>
                {likes.slice(0,3).map(item=>(
                  <Col xs={8} sm={8} key={item.project_id}>
                    <Card hoverable bordered={false} style={{borderRadius:8,height:'100%'}} bodyStyle={{padding:10}}>
                      <Image height={130} width="100%" style={{objectFit:'cover'}} src={fixImg(item.cover)}/>
                      <div style={{fontSize:13,marginTop:8,fontWeight:500}}>{item.title}</div>
                    </Card>
                  </Col>
                ))}
              </Row>
            ):<Typography.Text type="secondary">暂无点赞</Typography.Text>}
          </Card>

          <Card 
            title="我的评论" 
            bordered={false}
            style={{marginBottom:16,borderRadius:12,boxShadow:'0 1px 8px rgba(0,0,0,0.06)'}}
            extra={<Button onClick={()=>navigate('/user/comments')}>查看更多</Button>}
          >
            {listLoading ? (
              <Card loading />
            ) : comments.length > 0 ? (
              <div>
                {comments.slice(0, 2).map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 10,
                      paddingLeft: 40,
                      marginTop: 8,
                      border: 'none',
                      borderRadius: 8,
                      marginBottom: 8,
                      backgroundColor:'#fff'
                    }}
                  >
                    <div style={{ fontWeight: 500 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                      {item.content}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Typography.Text type="secondary">暂无评论</Typography.Text>
            )}
          </Card>

        </div>
      </Content>
    </Layout>
  );
};

export default VisitorProfile;