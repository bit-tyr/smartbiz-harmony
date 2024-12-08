import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="layout-container">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  );
};