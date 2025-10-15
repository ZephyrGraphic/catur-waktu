"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { PlusIcon, ClipboardIcon, CalendarIcon, ClockIcon, UsersIcon, SettingsIcon, CheckIcon } from "lucide-react"
import Link from "next/link"

interface User {
  nama: string
  tanggalLahir: string
}

interface Task {
  id: string
  title: string
  deadline: string
  notes: string
  mentor: string
  soundNotification: boolean
  completed: boolean
  alarmMuted?: boolean
  snoozeUntil?: string
}

export default function BerandaPage() {
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [soundEnabledDefault, setSoundEnabledDefault] = useState(true)
  const [newTask, setNewTask] = useState({
    title: "",
    deadline: "",
    notes: "",
    mentor: "",
    soundNotification: true, // will be overridden after prefs load
  })

  const timeoutsRef = useRef<Record<string, number>>({})

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem("catur_waktu_user")
    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Load tasks
    const tasksData = localStorage.getItem("catur_waktu_tasks")
    if (tasksData) {
      setTasks(JSON.parse(tasksData))
    }

    const soundPref = localStorage.getItem("catur_waktu_sound_enabled")
    const pref = soundPref === null ? true : soundPref === "true"
    setSoundEnabledDefault(pref)
    setNewTask((prev) => ({ ...prev, soundNotification: pref }))
  }, [])

  useEffect(() => {
    scheduleAllAlarms(tasks)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(tasks)])

  function persistTasks(next: Task[]) {
    setTasks(next)
    localStorage.setItem("catur_waktu_tasks", JSON.stringify(next))
    scheduleAllAlarms(next)
  }

  async function showDeadlineNotification(task: Task) {
    const title = "Pengingat Tugas"
    const body = `3 jam lagi: ${task.title}`

    try {
      const permission = await ensureNotificationPermission()
      if (permission !== "granted") {
        // Permission declined or unavailable; fail gracefully without throwing
        // Optionally you can surface a toast here.
        return
      }

      // Try using the Service Worker first
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.getRegistration()
        if (reg && "showNotification" in reg) {
          await reg.showNotification(title, {
            body,
            icon: "/icons/icon-192.jpg",
            tag: `deadline-${task.id}`,
            vibrate: [100, 50, 100],
            requireInteraction: true,
          })
          return
        }
      }

      // Fallback to window Notification if SW unavailable
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body, icon: "/icons/icon-192.jpg" })
        return
      }
    } catch (err) {
      // Swallow errors to avoid unhandled promise rejections
      console.log("[v0] showDeadlineNotification error:", (err as Error)?.message)
    }
  }

  function clearAlarm(taskId: string) {
    const t = timeoutsRef.current[taskId]
    if (t) {
      clearTimeout(t)
      delete timeoutsRef.current[taskId]
    }
  }

  function scheduleAllAlarms(list: Task[]) {
    // clear all
    Object.keys(timeoutsRef.current).forEach((id) => clearAlarm(id))
    list.forEach((task) => scheduleAlarm(task))
  }

  function scheduleAlarm(task: Task) {
    if (task.completed) return
    const deadlineMs = new Date(task.deadline).getTime()
    if (isNaN(deadlineMs)) return
    const alertMs = deadlineMs - 3 * 60 * 60 * 1000
    const now = Date.now()

    // respect snooze or mute if present
    // @ts-ignore optional fields
    if (task.alarmMuted) return
    // @ts-ignore
    const snoozeUntil = task.snoozeUntil ? new Date(task.snoozeUntil).getTime() : null
    let triggerAt = alertMs
    if (snoozeUntil && snoozeUntil > now) {
      triggerAt = Math.max(triggerAt, snoozeUntil)
    }

    if (triggerAt <= now) {
      showDeadlineNotification(task)
      return
    }
    const wait = triggerAt - now
    const t = window.setTimeout(() => {
      showDeadlineNotification(task)
      delete timeoutsRef.current[task.id]
    }, wait)
    timeoutsRef.current[task.id] = t
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      completed: false,
    }

    const updatedTasks = [...tasks, task]
    persistTasks(updatedTasks)

    setNewTask({
      title: "",
      deadline: "",
      notes: "",
      mentor: "",
      soundNotification: soundEnabledDefault,
    })
    setIsAddModalOpen(false)
  }

  const toggleTaskComplete = (taskId: string) => {
    const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
    persistTasks(updatedTasks)
  }

  function setAlarmMuted(taskId: string, muted: boolean) {
    const next = tasks.map((t) => (t.id === taskId ? { ...t, alarmMuted: muted } : t))
    persistTasks(next)
    if (muted) clearAlarm(taskId)
  }

  function snoozeTask(taskId: string, minutesToSnooze: number) {
    const until = new Date(Date.now() + minutesToSnooze * 60000).toISOString()
    const next = tasks.map((t) => (t.id === taskId ? { ...t, snoozeUntil: until } : t))
    persistTasks(next)
  }

  const upcomingTasks = tasks.filter((task) => !task.completed).slice(0, 3)
  const level = Math.floor(tasks.filter((task) => task.completed).length / 3) + 1
  const completedTasks = tasks.filter((task) => task.completed).length
  const xpProgress = ((completedTasks % 3) / 3) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-card">
        <h1 className="text-xl font-semibold">Halo, {user?.nama || "Pengguna"}!</h1>
        <Link href="/profil">
          <Button type="button" variant="ghost" size="icon" className="text-primary">
            <SettingsIcon className="w-5 h-5" />
          </Button>
        </Link>
      </header>

      <div className="p-4 space-y-6 pb-20">
        {/* Gamification Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">{level}</span>
              </div>
              Level {level} - Time Master
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progres XP</span>
                <span>{completedTasks} tugas selesai</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-accent h-3 rounded-full transition-all duration-300"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
            <div className="bg-card/50 rounded-lg p-3">
              <p className="text-sm font-medium text-primary">Fokus Hari Ini</p>
              <p className="text-xs text-muted-foreground">
                "Produktivitas bukan tentang melakukan lebih banyak, tetapi melakukan hal yang tepat."
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Action Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Rangkuman Aktivitas Anda</h2>
          <div className="grid grid-cols-2 gap-4">
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                      <ClipboardIcon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <span className="font-medium text-primary">Catat</span>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle>Tambah Tugas Baru</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddTask} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Apa yang ingin kamu lakukan?</label>
                    <Input
                      placeholder="Nama tugas..."
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kapan deadlinenya?</label>
                    <Input
                      type="datetime-local"
                      value={newTask.deadline}
                      onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tambahkan Catatan</label>
                    <textarea
                      className="flex w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Catatan tambahan..."
                      value={newTask.notes}
                      onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Siapa Mentormu? (Opsional)</label>
                    <Input
                      placeholder="Nama mentor..."
                      value={newTask.mentor}
                      onChange={(e) => setNewTask({ ...newTask, mentor: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Atur Notifikasi Suara</label>
                    <Switch
                      checked={newTask.soundNotification}
                      onCheckedChange={(checked) => setNewTask({ ...newTask, soundNotification: checked })}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      Simpan Jadwal
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                      Batal
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Link href="/jadwal">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="font-medium text-primary">Jadwal</span>
                </CardContent>
              </Card>
            </Link>

            <Link href="/riwayat">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <ClockIcon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="font-medium text-primary">Riwayat</span>
                </CardContent>
              </Card>
            </Link>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <UsersIcon className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-medium text-primary">Monitoring</span>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Jadwal Terdekat</h2>
          <div className="space-y-3">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => {
                const muted = !!task.alarmMuted
                const snoozeUntil = task.snoozeUntil ? new Date(task.snoozeUntil) : null
                const deadline = new Date(task.deadline)
                const minsLeft = minutes(deadline.getTime() - Date.now() - 3 * 60 * 60 * 1000)

                return (
                  <Card key={task.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="flex items-center gap-3 p-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary hover:bg-primary/10"
                        onClick={() => toggleTaskComplete(task.id)}
                      >
                        <div className="w-5 h-5 border-2 border-primary rounded-md flex items-center justify-center">
                          {task.completed && <CheckIcon className="w-3 h-3 text-primary" />}
                        </div>
                      </Button>
                      <div className="flex-1">
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {deadline.toLocaleString("id-ID")}
                          {snoozeUntil ? ` • Dijeda hingga ${snoozeUntil.toLocaleTimeString("id-ID")}` : ""}
                          {muted ? " • Alarm dimatikan" : ""}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={muted ? "secondary" : "outline"}
                            onClick={() => setAlarmMuted(task.id, !muted)}
                            className={muted ? "text-muted-foreground" : "text-primary"}
                          >
                            {muted ? "Nyalakan Alarm" : "Matikan Alarm"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => snoozeTask(task.id, 5)}>
                            Jeda 5m
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => snoozeTask(task.id, 10)}>
                            Jeda 10m
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => snoozeTask(task.id, 15)}>
                            Jeda 15m
                          </Button>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {minsLeft > 0 ? `Alarm dalam ~${minsLeft}m` : "Alarm siap / terlewat"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center p-8 text-center">
                  <div className="space-y-2">
                    <CalendarIcon className="w-8 h-8 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">Belum ada jadwal terdekat</p>
                    <p className="text-sm text-muted-foreground">Tambah tugas baru untuk memulai</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
          >
            <PlusIcon className="w-6 h-6" />
          </Button>
        </DialogTrigger>
      </Dialog>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t">
        <div className="flex items-center justify-around py-2">
          <Link href="/beranda" className="flex flex-col items-center p-2 text-primary">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="text-xs mt-1 font-medium">Beranda</span>
          </Link>

          <Link href="/jadwal" className="flex flex-col items-center p-2 text-muted-foreground">
            <CalendarIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Jadwal</span>
          </Link>

          <Link href="/riwayat" className="flex flex-col items-center p-2 text-muted-foreground">
            <ClockIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Riwayat</span>
          </Link>

          <Link href="/profil" className="flex flex-col items-center p-2 text-muted-foreground">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-xs mt-1">Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}

function minutes(ms: number) {
  return Math.floor(ms / 60000)
}

async function ensureNotificationPermission(): Promise<"granted" | "denied"> {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied"
  let status: NotificationPermission = Notification.permission
  if (status === "default") {
    try {
      status = await Notification.requestPermission()
    } catch {
      status = "denied"
    }
  }
  return status === "granted" ? "granted" : "denied"
}
