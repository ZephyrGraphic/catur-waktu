"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const [nama, setNama] = useState("")
  const [tanggalLahir, setTanggalLahir] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (nama && tanggalLahir) {
      // Store user data in localStorage
      localStorage.setItem("catur_waktu_user", JSON.stringify({ nama, tanggalLahir }))
      router.push("/beranda")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-balance">Selamat Datang di CATUR WAKTU</CardTitle>
            <p className="text-muted-foreground mt-2 text-pretty">Catat, Atur, Tindak, dan Ukur produktivitasmu.</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="nama" className="text-sm font-medium">
                Masukkan Nama Anda
              </label>
              <Input
                id="nama"
                type="text"
                placeholder="Nama lengkap Anda"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="tanggal-lahir" className="text-sm font-medium">
                Tanggal Lahir
              </label>
              <Input
                id="tanggal-lahir"
                type="date"
                value={tanggalLahir}
                onChange={(e) => setTanggalLahir(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
              size="lg"
            >
              Mulai Sekarang
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
