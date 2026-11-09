document.addEventListener("DOMContentLoaded", async () => {
  // Get the auth button from the navigation bar
  const authLink = document.getElementById("auth-link");
  const logoutBtn = document.getElementById("logout-btn");

  // Ask Supabase if the user is currently logged in
  const {
    data: { session },
    error,
  } = await window.supabaseClient.auth.getSession();

  if (session) {
    // --- USER IS LOGGED IN ---
    if (authLink) {
      authLink.href = "profile.html";
      authLink.textContent = "Profile";
      authLink.className = "btn btn-outline btn-sm"; // Changes styling to look like a profile button
    }
  } else {
    // --- USER IS LOGGED OUT ---
    if (authLink) {
      authLink.href = "login.html";
      authLink.textContent = "Login";
      authLink.className = "btn btn-primary btn-sm"; // Changes styling to a blue login button
    }

    // If they are logged out but somehow on the profile page, kick them back to home
    if (window.location.pathname.includes("profile.html")) {
      window.location.href = "login.html";
    }
  }

  // Handle the "Log Out" button on the profile page
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await window.supabaseClient.auth.signOut();
      window.location.href = "index.html"; // Send them back to the homepage after logging out
    });
  }
});
