"use client"

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from "@/components/ui/sidebar";

const getPageTitle = (pathname: string) => {
  switch (pathname) {
    case '/':
      return 'Chat';
    case '/history':
      return 'History';
    case '/tools':
      return 'Tools';
    case '/settings':
      return 'Settings';
    default:
      return 'Chat';
  }
};

export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="h-4 w-px bg-sidebar-border" />
        <h1 className="font-semibold">{title}</h1>
      </div>
    </header>
  );
}
