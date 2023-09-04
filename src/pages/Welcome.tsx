import { request, useModel } from '@umijs/max';
import { InfoCircleTwoTone, LoadingOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Modal, Row, Space, Spin, Typography, message, theme } from 'antd';
import React, { useEffect, useState } from 'react';


const Welcome: React.FC = () => {
  // const { token } = theme.useToken();
  const { initialState }: any = useModel('@@initialState');
  const [showLoadingModal, setShowLoadingModal] = useState(false)

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const SAMLRequest = queryParams.get('SAMLRequest'),
      RelayState = queryParams.get('RelayState');

    if (SAMLRequest) {
      setShowLoadingModal(true)

      request('/sso', {
        method: "POST",
        data: {
          SAMLRequest,
          username: initialState.currentUser.tally_accounts.find((e: any) => e.company == initialState.currentUser.selectedCompany).username
        }
      })
      .then((u) => {
        if (u) {
          setShowLoadingModal(false)
          // request('https://toc.grevity.in/guacamole/api/ext/saml/callback', {
          //   method: "POST",
          //   data: {
          //     SAMLResponse: u,
          //     RelayState
          //   }
          // })
          
          const params = new URLSearchParams();
          params.append('SAMLResponse', u);
          params.append('RelayState', RelayState as string);

          fetch('https://toc.grevity.in/guacamole/api/ext/saml/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
          })
          .then(response => {
            // Check if the response is a redirect
            if (response.redirected) {
              // Navigate to the redirect URL
              window.location.href = response.url;
            } else {
              return response.json();
            }
          })
            .then(data => console.log(data))
            .catch(error => console.error(error));
        }
      })
      .catch((err) => {
        setShowLoadingModal(false)
        message.error({
          content: "Something went wrong"
        })
      })
    }

  }, [])

  return (
    <PageContainer>
      <Modal
        title={<Space><InfoCircleTwoTone /> Starting Tally on Cloud</Space>}
        centered
        open={showLoadingModal}
        closeIcon={null}
        footer={null}
      >
        <Row style={{ padding: "34px" }} justify={"center"}>
          <Typography.Text>
            Please wait a moment
            <Spin style={{ marginLeft: "12px" }} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          </Typography.Text>
        </Row>
      </Modal>
    </PageContainer>
  );
};

export default Welcome;
