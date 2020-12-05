import React, { useState, useEffect } from "react";
import { Layout, Typography, Tabs } from "antd";
import { HashRouter, Switch, Route } from 'react-router-dom'

import Main from "./Main";
import { Design } from './Design'
import VisualPage from './Mapping'
import Preview from './Preview';

const { Sider, Content } = Layout;
const { Text } = Typography;
const { TabPane } = Tabs
const SiderAttrs = {
  collapsedWidth: 0,
  collapsible: true,
  theme: "light",
  zeroWidthTriggerStyle: {
    top: "30px",
    right: "100%"
  },
  width: "50%",
  breakpoint: "sm"
};

const Home = (props) => {
  const [collapsed, setCollapsed] = useState(false);
  const [output, setOutput] = useState([
    {
      type: "docs",
      children: [
        {
          type: "paragraph",
          children: [{ text: "This is editable " }]
        }
      ]
    }
  ]);

  return (
    <>
      <HashRouter>
        <Switch>
          <Route path='/builder/:uid/:entryId?'>
          <Layout style={{ minHeight: "100vh" }}>
            <Content style={{ background: "white" }}>
              <Main setOutput={setOutput} />
            </Content>

            <Sider
              collapsed={collapsed}
              onCollapse={() => setCollapsed(!collapsed)}
              {...SiderAttrs}
              style={{ background: "#eaffff" }}
            >
              <pre style={{ padding: "0 2rem" }}>
                    <Text underline strong>
                      Preview
                    </Text>
                    <br />
                    {JSON.stringify(output, null, 2)}
                  </pre>
              
            </Sider>
          </Layout>
          </Route>

          <Route exact path='/visual'>
            <VisualPage />
          </Route>

          <Route path='/preview/:uid/:entryId?'>
            <Preview/>
          </Route>
        </Switch>
      </HashRouter>
      
    </>
  );
};

export default Home;
