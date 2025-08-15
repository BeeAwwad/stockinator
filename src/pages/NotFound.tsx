const NotFound = () => {
  return (
    <div>
      <div className="flex items-center justify-center mt-8">
        <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
          404 - Page Not Found
        </h1>
      </div>
      <div className="flex items-center justify-center mt-4">
        <p className="text-lg text-muted-foreground">
          The page you are looking for does not exist.
        </p>
      </div>
    </div>
  )
}

export default NotFound
