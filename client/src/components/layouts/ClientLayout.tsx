import React from "react";
import { useLocation } from "wouter";
import { 
  BarChart2, 
  Users, 
  Mail, 
  FileText, 
  Globe, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Sparkles,
  Home
} from "lucide-react";
import { Helmet } from "react-helmet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useClientSession } from "@/hooks/use-client-session";
import { Button } from "@/components/ui/button";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [location, navigate] = useLocation();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [open, setOpen] = React.useState(false);
  const { clientName, logout } = useClientSession();

  const handleClick = (href: string) => {
    if (location !== href) {
      navigate(href);
    }
    if (isMobile) {
      setOpen(false);
    }
  };

  const navigation = [
    { name: "Dashboard", href: "/client/dashboard", icon: Home },
    { name: "Campaigns", href: "/client/campaigns", icon: Mail },
    { name: "Contacts", href: "/client/contacts", icon: Users },
    { name: "Templates", href: "/client/templates", icon: FileText },
    { name: "AI Tools", href: "/client/ai-tools", icon: Sparkles },
    { name: "Reports", href: "/client/reports", icon: BarChart2 },
    { name: "Domains", href: "/client/domains", icon: Globe },
    { name: "Settings", href: "/client/settings", icon: Settings },
  ];

  const MainNavigation = () => (
    <div className="flex flex-col gap-1 py-2">
      {navigation.map((item) => {
        const isActive = location === item.href;
        return (
          <Button
            key={item.name}
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "justify-start mb-1 font-normal",
              isActive && "font-medium bg-secondary"
            )}
            onClick={() => handleClick(item.href)}
          >
            <item.icon className={cn("mr-2 h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
            {item.name}
          </Button>
        );
      })}
    </div>
  );

  const handleLogout = async () => {
    await logout();
    navigate("/client/login");
  };

  const MainContent = () => (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>Client Portal | InfyMail</title>
      </Helmet>

      {/* Mobile Header */}
      <header className="flex md:hidden sticky top-0 justify-between items-center p-4 bg-white border-b z-10">
        <div className="flex items-center">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] p-4">
              <div className="flex flex-col h-full">
                <div className="mb-4 flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  <span className="ml-2 font-medium">{clientName}</span>
                </div>
                <MainNavigation />
                <div className="mt-auto pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start w-full text-red-500 hover:text-red-500 hover:bg-red-50 font-normal"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="ml-2 text-lg font-medium">{clientName}</h1>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for larger screens */}
        <aside className="hidden md:flex md:w-[240px] border-r p-4 flex-col h-screen sticky top-0">
          <div className="flex items-center mb-6">
            <span className="font-medium text-lg">{clientName}</span>
          </div>
          <MainNavigation />
          <div className="mt-auto pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="justify-start w-full text-red-500 hover:text-red-500 hover:bg-red-50 font-normal"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 p-4 md:p-6 overflow-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );

  return <MainContent />;
}