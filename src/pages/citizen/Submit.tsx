import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle, Lightbulb, PartyPopper, HandHelping,
  ArrowRight, ArrowLeft, Check, MapPin, Camera, Loader2,
  ChevronLeft, Upload, Navigation
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/store/AuthContext'
import { createSubmission } from '@/services/submission'
import type { SubmissionType } from '@/types'

const submissionTypes = [
  { id: 'problem' as SubmissionType, icon: AlertTriangle, label: 'Report Problem', desc: 'Roads, water, electricity, healthcare', color: 'text-danger', bg: 'bg-danger/5' },
  { id: 'suggestion' as SubmissionType, icon: Lightbulb, label: 'Suggest Idea', desc: 'Library, sports ground, development', color: 'text-warning', bg: 'bg-warning/5' },
  { id: 'invite' as SubmissionType, icon: PartyPopper, label: 'Invite MP', desc: 'Events, functions, community programs', color: 'text-purple-600', bg: 'bg-purple-500/5' },
  { id: 'help' as SubmissionType, icon: HandHelping, label: 'Request Help', desc: 'Medical, scholarship, emergency', color: 'text-primary', bg: 'bg-primary/5' },
]

export default function Submit() {
  const { citizen } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(0)
  const [selectedType, setSelectedType] = useState<SubmissionType | null>(null)
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [locating, setLocating] = useState(false)

  if (!citizen) {
    navigate('/auth')
    return null
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => setImageUrl(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const getLocation = () => {
    setLocating(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`)
          setLocating(false)
        },
        () => {
          setLocation('Location access denied')
          setLocating(false)
        }
      )
    } else {
      setLocation('GPS not available')
      setLocating(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedType || !description || !citizen) return
    setLoading(true)
    try {
      await createSubmission(citizen.id, citizen.phone, selectedType, description, imageUrl, location || 'Not specified')
      setSubmitted(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    // Step 0: Choose type
    <motion.div key="type" className="space-y-4">
      <h2 className="text-2xl font-bold text-card-foreground">Namaste 👋</h2>
      <p className="text-muted-foreground">How can your MP help today?</p>
      <div className="grid gap-3 pt-2">
        {submissionTypes.map((t) => {
          const Icon = t.icon
          return (
            <motion.button
              key={t.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedType(t.id)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                selectedType === t.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl ${t.bg} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${t.color}`} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-card-foreground">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
              {selectedType === t.id && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    </motion.div>,

    // Step 1: Describe
    <motion.div key="desc" className="space-y-4">
      <h2 className="text-xl font-bold text-card-foreground">Describe your {selectedType}</h2>
      <p className="text-sm text-muted-foreground">Please provide as much detail as possible</p>
      <Textarea
        placeholder={
          selectedType === 'problem' ? 'Describe the problem... e.g., Village road is broken, ambulances cannot come...' :
          selectedType === 'suggestion' ? 'Share your idea... e.g., We need a community library for students...' :
          selectedType === 'invite' ? 'Tell us about your event... e.g., Annual village fair on March 15th...' :
          'Describe your need... e.g., Need scholarship for college admission...'
        }
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="min-h-[160px]"
      />
      <p className="text-xs text-muted-foreground">{description.length} characters</p>
    </motion.div>,

    // Step 2: Upload photo
    <motion.div key="photo" className="space-y-4">
      <h2 className="text-xl font-bold text-card-foreground">Add a Photo</h2>
      <p className="text-sm text-muted-foreground">Optional but helps us understand better</p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full min-h-[200px] rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer bg-card hover:bg-primary/5"
      >
        {imageUrl ? (
          <img src={imageUrl} alt="Uploaded" className="max-h-[200px] rounded-xl object-contain" />
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <Camera className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Tap to upload a photo</p>
            <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP</p>
          </>
        )}
      </button>
      {imageUrl && (
        <button
          onClick={() => { setImageUrl(null); setImageFile(null) }}
          className="text-sm text-danger hover:underline cursor-pointer"
        >
          Remove photo
        </button>
      )}
    </motion.div>,

    // Step 3: Location
    <motion.div key="location" className="space-y-4">
      <h2 className="text-xl font-bold text-card-foreground">Your Location</h2>
      <p className="text-sm text-muted-foreground">Where is this happening?</p>
      <div className="relative">
        <MapPin className="absolute left-4 top-4 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Enter your location (e.g., Rampur, Block 2)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="pl-11"
        />
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={getLocation}
        loading={locating}
      >
        <Navigation className="mr-2 w-4 h-4" />
        Use My Location
      </Button>
    </motion.div>,

    // Step 4: Review & Submit
    <motion.div key="review" className="space-y-4">
      <h2 className="text-xl font-bold text-card-foreground">Review & Submit</h2>
      <Card className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Type</span>
          <span className="text-sm font-medium capitalize">{selectedType}</span>
        </div>
        <div className="border-t border-border pt-3">
          <span className="text-sm text-muted-foreground block mb-1">Description</span>
          <p className="text-sm">{description}</p>
        </div>
        {imageUrl && (
          <div className="border-t border-border pt-3">
            <span className="text-sm text-muted-foreground block mb-1">Photo</span>
            <img src={imageUrl} alt="Uploaded" className="h-24 rounded-lg object-cover" />
          </div>
        )}
        <div className="border-t border-border pt-3">
          <span className="text-sm text-muted-foreground block mb-1">Location</span>
          <p className="text-sm">{location || 'Not specified'}</p>
        </div>
      </Card>
    </motion.div>,
  ]

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm mx-auto px-6"
        >
          <div className="w-20 h-20 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-card-foreground mb-2">Submitted Successfully!</h2>
          <p className="text-muted-foreground mb-8">
            Your voice has been recorded. AI is analyzing your submission and it will reach your MP.
          </p>
          <Button className="w-full mb-3" onClick={() => navigate('/status')}>
            Track Status
          </Button>
          <Button variant="outline" className="w-full" onClick={() => { setSubmitted(false); setStep(0); setSelectedType(null); setDescription(''); setImageUrl(null); setLocation('') }}>
            Submit Another
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : navigate('/submit')}
            className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-card-foreground" />
          </button>
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step ? 'w-8 bg-primary' : i < step ? 'bg-primary/50' : 'bg-border'
                }`}
              />
            ))}
          </div>
          <div className="w-10" />
        </div>

        <AnimatePresence mode="wait">
          {steps[step]}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 space-y-3">
          {step < steps.length - 1 ? (
            <Button
              className="w-full"
              size="lg"
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 0 && !selectedType) ||
                (step === 1 && !description.trim())
              }
            >
              Continue
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          ) : (
            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              loading={loading}
            >
              Submit to MP
              <Upload className="ml-2 w-4 h-4" />
            </Button>
          )}
          {step > 0 && (
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
