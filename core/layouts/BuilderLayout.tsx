import React from 'react'
import Layout from './Layout'
import WebsiteBuilderTopbar from './builder-bar/WebsiteBuilderTopbar'
// import WebsiteBuilderBottombar from './builder-bar/WebsiteBuilderBottombar'
// import WebsiteBuilderLeftbar from './builder-bar/WebsiteBuilderLeftbar'
// import WebsiteBuilderRightbar from './builder-bar/WebsiteBuilderRightbar'

function BuilderLayout({ children }: { children: React.ReactNode }) {
    return (
        <Layout
            topbarContent={<WebsiteBuilderTopbar />}
        // rightbarContent={<WebsiteBuilderRightbar />}
        // bottombarContent={<WebsiteBuilderBottombar />}
        // leftbarContent={<WebsiteBuilderLeftbar />}
        >
            {children}
        </Layout>
    )
}

export default BuilderLayout