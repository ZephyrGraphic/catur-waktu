"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Toggle } from "@/components/ui/toggle"
import { CalendarIcon, ClockIcon, ArrowLeftIcon, UserIcon, MoonIcon, SunIcon, EditIcon, BellIcon } from "lucide-react"
import Link from "next/link"

interface User {
  nama: string
  tanggalLahir: string
}

export default function ProfilPage() {
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState("")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem("catur_waktu_user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setEditedName(parsedUser.nama)
    }

    // Load tasks
    const tasksData = localStorage.getItem("catur_waktu_tasks")
    if (tasksData) {
      setTasks(JSON.parse(tasksData))
    }

    // Load theme preference
    const themePreference = localStorage.getItem("catur_waktu_theme")
    if (themePreference === "dark") {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }

    // Load sound preference
    const soundPref = localStorage.getItem("catur_waktu_sound_enabled")
    if (soundPref !== null) {
      setSoundEnabled(soundPref === "true")
    }
    setHydrated(true)
  }, [])

  const handleThemeToggle = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)

    if (newTheme) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("catur_waktu_theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("catur_waktu_theme", "light")
    }
  }

  const handleSaveName = () => {
    if (editedName.trim()) {
      const updatedUser = {
        nama: editedName.trim(),
        tanggalLahir: user?.tanggalLahir || new Date().toISOString(),
      }
      setUser(updatedUser)
      localStorage.setItem("catur_waktu_user", JSON.stringify(updatedUser))
      setIsEditing(false)
    }
  }

  const handleSoundToggle = () => {
    const next = !soundEnabled
    setSoundEnabled(next)
    localStorage.setItem("catur_waktu_sound_enabled", next ? "true" : "false")
  }

  const completedTasks = tasks.filter((task) => task.completed).length
  const level = Math.floor(completedTasks / 3) + 1

  if (!hydrated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 p-4 border-b bg-card">
        <Link href="/beranda">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">Profil</h1>
      </header>

      <div className="p-4 space-y-6 pb-20">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-primary-foreground" />
              </div>
              Informasi Pengguna
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama</label>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="Masukkan nama baru"
                  />
                  <Button onClick={handleSaveName} size="sm">
                    Simpan
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false)
                      setEditedName(user?.nama || "")
                    }}
                  >
                    Batal
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-lg font-medium">{user?.nama || "Nama Belum Diatur"}</p>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                    <EditIcon className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Lahir</label>
              <p className="text-base">
                {user?.tanggalLahir
                  ? new Date(user.tanggalLahir).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Belum diatur"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Level Saat Ini</label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">{level}</span>
                </div>
                <span className="text-base font-medium">Level {level} - Time Master</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Statistik Aktivitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{tasks.length}</p>
                <p className="text-sm text-muted-foreground">Total Tugas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
                <p className="text-sm text-muted-foreground">Selesai</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  {isDarkMode ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-medium">Tema Aplikasi</p>
                  <p className="text-sm text-muted-foreground">{isDarkMode ? "Tema Gelap" : "Tema Terang"}</p>
                </div>
              </div>
              <Toggle
                pressed={isDarkMode}
                onPressedChange={handleThemeToggle}
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                aria-label="Ubah tema aplikasi"
              >
                {isDarkMode ? "Gelap" : "Terang"}
              </Toggle>
            </div>

            {/* Suara Notifikasi global toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <BellIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">Suara Notifikasi</p>
                  <p className="text-sm text-muted-foreground">
                    {soundEnabled ? "Aktif" : "Nonaktif"} — digunakan sebagai default saat menambah tugas
                  </p>
                </div>
              </div>
              <Toggle
                pressed={soundEnabled}
                onPressedChange={handleSoundToggle}
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                aria-label="Atur suara notifikasi"
              >
                {soundEnabled ? "Aktif" : "Off"}
              </Toggle>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-lg">CATUR WAKTU</h3>
            <p className="text-sm text-muted-foreground">Catat, Atur, Tindak, dan Ukur produktivitasmu</p>
            <p className="text-xs text-muted-foreground mt-2">Versi 1.0.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t">
        <div className="flex items-center justify-around py-2">
          <Link href="/beranda" className="flex flex-col items-center p-2 text-muted-foreground">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="text-xs mt-1">Beranda</span>
          </Link>

          <Link href="/jadwal" className="flex flex-col items-center p-2 text-muted-foreground">
            <CalendarIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Jadwal</span>
          </Link>

          <Link href="/riwayat" className="flex flex-col items-center p-2 text-muted-foreground">
            <ClockIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Riwayat</span>
          </Link>

          <Link href="/profil" className="flex flex-col items-center p-2 text-primary">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-xs mt-1 font-medium">Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
