import { Link, useLocation } from "react-router-dom";

export function ComingSoon() {
  const { pathname } = useLocation();
  return (
    <div>
      <h1>Coming Soon</h1>
      <p>该路由暂未实现：<code>{pathname}</code></p>
      <Link to="/">← 返回首页</Link>
    </div>
  );
}
