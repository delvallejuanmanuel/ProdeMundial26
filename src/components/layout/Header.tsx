"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, User, Bell, ShieldAlert, X } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { NotificationBell } from './NotificationBell';

interface HeaderProps {
  isAdmin?: boolean;
  isLoggedIn?: boolean;
}

export function Header({ isAdmin = false, isLoggedIn = true }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="font-black text-xl tracking-tighter">
              PRODE<span className="text-primary">26</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {isLoggedIn ? (
              <>
                <div className="hidden md:flex items-center gap-6 font-medium text-sm text-muted-foreground">
                  <Link href="/" className="hover:text-primary transition-colors text-foreground">Fixture</Link>
                  <Link href="/leaderboard" className="hover:text-primary transition-colors">Posiciones</Link>
                  <Link href="/especiales" className="hover:text-primary transition-colors">Especiales</Link>
                  <Link href="/estadisticas" className="hover:text-primary transition-colors">Estadísticas</Link>
                  <Link href="/reglas" className="hover:text-primary transition-colors">Reglas</Link>
                  {isAdmin && (
                    <Link href="/admin" className="hover:text-primary transition-colors flex items-center gap-1 text-primary">
                      <ShieldAlert className="w-4 h-4" /> Admin
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-6 font-medium text-sm text-muted-foreground">
                <Link href="/leaderboard" className="hover:text-primary transition-colors">Posiciones</Link>
                <Link href="/estadisticas" className="hover:text-primary transition-colors">Estadísticas</Link>
                <Link href="/reglas" className="hover:text-primary transition-colors">Reglas</Link>
              </div>
            )}
            
            {!isLoggedIn && (
              <Link href="/login" className={buttonVariants({ variant: "outline", size: "sm", className: "hidden sm:inline-flex border-border/50 bg-background/50 backdrop-blur-sm" })}>
                Ingresar
              </Link>
            )}
          </div>

          {/* User Actions */}
          {isLoggedIn && (
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link href="/admin" className={buttonVariants({ variant: "ghost", size: "icon", className: "text-primary md:hidden" })}>
                  <ShieldAlert className="h-5 w-5" />
                </Link>
              )}
              <NotificationBell />
              <Link href="/perfil" className={buttonVariants({ variant: "outline", className: "hidden sm:flex gap-2 rounded-full border-border/50 bg-secondary/50" })}>
                <User className="h-4 w-4" />
                <span>Mi Perfil</span>
              </Link>
            </div>
          )}

        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm md:hidden flex flex-col">
          <div className="flex items-center justify-between px-4 h-16 border-b border-border/50">
            <div className="font-black text-xl tracking-tighter">
              PRODE<span className="text-primary">26</span>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex flex-col gap-6 p-6 overflow-y-auto">
            {isLoggedIn ? (
              <>
                <Link href="/" className="text-lg font-medium" onClick={toggleMobileMenu}>Fixture</Link>
                <Link href="/leaderboard" className="text-lg font-medium" onClick={toggleMobileMenu}>Posiciones</Link>
                <Link href="/especiales" className="text-lg font-medium" onClick={toggleMobileMenu}>Especiales</Link>
                <Link href="/estadisticas" className="text-lg font-medium" onClick={toggleMobileMenu}>Estadísticas</Link>
                <Link href="/reglas" className="text-lg font-medium" onClick={toggleMobileMenu}>Reglas</Link>
                <Link href="/perfil" className="text-lg font-medium flex items-center gap-2" onClick={toggleMobileMenu}>
                  <User className="h-5 w-5" /> Mi Perfil
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-lg font-medium text-primary flex items-center gap-2" onClick={toggleMobileMenu}>
                    <ShieldAlert className="w-5 h-5" /> Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/leaderboard" className="text-lg font-medium" onClick={toggleMobileMenu}>Posiciones</Link>
                <Link href="/estadisticas" className="text-lg font-medium" onClick={toggleMobileMenu}>Estadísticas</Link>
                <Link href="/reglas" className="text-lg font-medium" onClick={toggleMobileMenu}>Reglas</Link>
                <Link href="/login" className={buttonVariants({ variant: "default", className: "w-full mt-4" })} onClick={toggleMobileMenu}>
                  Ingresar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
