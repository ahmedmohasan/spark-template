import { SignupForm } from "./components/SignupForm"

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Join Us</h1>
          <p className="text-muted-foreground text-lg">
            Start your journey with our amazing platform
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}

export default App