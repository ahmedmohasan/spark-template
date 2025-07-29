import { useState } from "react"
import { Eye, EyeOff, CheckCircle, AlertCircle } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useKV } from '@github/spark/hooks'

interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export function SignupForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const [users, setUsers] = useKV("registered-users", [] as Array<{
    id: string
    firstName: string
    lastName: string
    email: string
    createdAt: string
  }>)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const getPasswordStrength = (password: string): { score: number; feedback: string[] } => {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) score += 25
    else feedback.push("At least 8 characters")

    if (/[a-z]/.test(password)) score += 25
    else feedback.push("One lowercase letter")

    if (/[A-Z]/.test(password)) score += 25
    else feedback.push("One uppercase letter")

    if (/\d/.test(password)) score += 25
    else feedback.push("One number")

    return { score, feedback }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    } else if (users.some(user => user.email.toLowerCase() === formData.email.toLowerCase())) {
      newErrors.email = "An account with this email already exists"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (getPasswordStrength(formData.password).score < 75) {
      newErrors.password = "Password is too weak"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      const newUser = {
        id: crypto.randomUUID(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        createdAt: new Date().toISOString()
      }

      setUsers(currentUsers => [...currentUsers, newUser])
      setIsSuccess(true)
    } catch (error) {
      setErrors({ general: "Something went wrong. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="mb-6">
            <CheckCircle size={64} className="text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome aboard!</h2>
            <p className="text-muted-foreground">
              Your account has been created successfully. You can now start exploring our platform.
            </p>
          </div>
          <Button 
            onClick={() => {
              setIsSuccess(false)
              setFormData({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                confirmPassword: ""
              })
            }}
            className="w-full"
          >
            Create Another Account
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
        <CardDescription>
          Join thousands of users already using our platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <Alert variant="destructive">
              <AlertCircle size={16} />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First name</Label>
              <Input
                id="first-name"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className={errors.firstName ? "border-destructive" : ""}
                placeholder="John"
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input
                id="last-name"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className={errors.lastName ? "border-destructive" : ""}
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={errors.email ? "border-destructive" : ""}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={errors.password ? "border-destructive pr-10" : "pr-10"}
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {formData.password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Password strength</span>
                  <span className={`font-medium ${
                    passwordStrength.score >= 75 ? "text-green-600" :
                    passwordStrength.score >= 50 ? "text-yellow-600" : "text-red-600"
                  }`}>
                    {passwordStrength.score >= 75 ? "Strong" :
                     passwordStrength.score >= 50 ? "Medium" : "Weak"}
                  </span>
                </div>
                <Progress value={passwordStrength.score} className="h-2" />
                {passwordStrength.feedback.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Missing: {passwordStrength.feedback.join(", ")}
                  </p>
                )}
              </div>
            )}
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Sign in
            </button>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}