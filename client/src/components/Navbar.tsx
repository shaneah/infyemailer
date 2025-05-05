import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { DoorOpen, Bell, HelpCircle, Settings, LogOut, Mail, Users, BarChart2, FileText, Plus, Search, Menu, PanelLeftClose, PanelLeftOpen, UserCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import MoodSelector from '@/components/MoodSelector';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed?: boolean;
  setSidebarCollapsed?: (collapsed: boolean) => void;
}

const Navbar = ({ 
  sidebarOpen, 
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed
}: NavbarProps) => {
  const { user, logoutMutation } = useAuth();
  const [_, setLocation] = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  
  // Refs for dropdown containers
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const helpMenuRef = useRef<HTMLDivElement>(null);
  const createMenuRef = useRef<HTMLDivElement>(null);
  
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logoutMutation.mutate();
  };
  
  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close user menu if click is outside
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      
      // Close notifications if click is outside
      if (showNotifications && notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      
      // Close help menu if click is outside
      if (showHelpMenu && helpMenuRef.current && !helpMenuRef.current.contains(event.target as Node)) {
        setShowHelpMenu(false);
      }
      
      // Close create menu if click is outside
      if (showCreateMenu && createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setShowCreateMenu(false);
      }
    };
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showNotifications, showHelpMenu, showCreateMenu]);

  const toggleSidebarCollapse = () => {
    if (setSidebarCollapsed && sidebarCollapsed !== undefined) {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return null;
};

export default Navbar;
