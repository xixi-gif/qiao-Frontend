import React, { useState, useEffect } from "react";
import { Card, Input, Button, Space, Typography } from "antd";

const RiverMessagePage = () => {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#f1c40f");
  const [ducks, setDucks] = useState([]);

  const colors = ["#f1c40f", "#e74c3c", "#3498db", "#2ecc71", "#9b59b6", "#f39c12"];

  const addDuck = () => {
    if (!name.trim()) return;
    const newDuck = {
      id: Date.now(),
      name: name,
      color: selectedColor,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      speed: Math.random() * 40 + 30,
      direction: Math.random() > 0.5,
    };
    setDucks([...ducks, newDuck]);
    setName("");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDucks((prev) =>
        prev.map((d) => {
          let newX = d.direction ? d.x + 0.3 : d.x - 0.3;
          let newDir = d.direction;
          if (newX > 90) newDir = false;
          if (newX < 10) newDir = true;
          return { ...d, x: newX, direction: newDir };
        })
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#e6f7ff", padding: "20px" }}>
      <Typography.Title level={2} style={{ textAlign: "center", margin: 0 }}>
        河流留言墙
      </Typography.Title>
      <Typography.Paragraph style={{ textAlign: "center", fontSize: 16, marginBottom: 20 }}>
        留下名字，生成会游动的小鸭子
      </Typography.Paragraph>

      <Card
        bodyStyle={{
          height: "calc(100vh - 240px)",
          background: "linear-gradient(to bottom, #87ceeb, #b0e0e6)",
          borderRadius: "24px",
          position: "relative",
          overflow: "hidden",
          padding: "20px",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "220px",
            background: "rgba(41, 128, 185, 0.4)",
          }}
        />

        {ducks.map((duck) => (
          <div
            key={duck.id}
            style={{
              position: "absolute",
              left: `${duck.x}%`,
              top: `${duck.y}%`,
              transition: "left 0.05s linear",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 600, whiteSpace: "nowrap" }}>
              {duck.name}
            </div>
            <div
              style={{
                width: 90,
                height: 60,
                backgroundColor: duck.color,
                borderRadius: "50%",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            />
          </div>
        ))}
      </Card>

      <Card style={{ marginTop: 20, borderRadius: 16 }}>
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <Input
            size="large"
            placeholder="请输入你的名字"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ fontSize: 16 }}
          />

          <Space wrap size={18}>
            {colors.map((c) => (
              <div
                key={c}
                onClick={() => setSelectedColor(c)}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  backgroundColor: c,
                  cursor: "pointer",
                  border: selectedColor === c ? "4px solid #222" : "2px solid #ddd",
                }}
              />
            ))}
          </Space>

          <Button
            type="primary"
            size="large"
            block
            onClick={addDuck}
            style={{ height: 56, fontSize: 18 }}
          >
            生成游动鸭子 🦆
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default RiverMessagePage;