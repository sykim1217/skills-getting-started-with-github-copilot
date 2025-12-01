document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Reset activity select (keep placeholder option)
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Header + basic details
        const headerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        activityCard.innerHTML = headerHTML;

        // Participants section
        const participantsLabel = document.createElement("p");
        participantsLabel.innerHTML = "<strong>Participants:</strong>";
        activityCard.appendChild(participantsLabel);

        if (Array.isArray(details.participants) && details.participants.length > 0) {
          const ul = document.createElement("ul");
          ul.className = "participants-list";

          details.participants.forEach((participant) => {
            const li = document.createElement("li");
            li.className = "participant";

            // Determine display name safely
            let displayName = typeof participant === "string" ? participant : participant.name || String(participant);

            // If it's an email, show name before @
            if (displayName.includes("@")) {
              displayName = displayName.split("@")[0];
            }

            const avatar = document.createElement("span");
            avatar.className = "avatar";
            avatar.textContent = displayName.trim().charAt(0).toUpperCase() || "?";

            const nameSpan = document.createElement("span");
            nameSpan.className = "participant-name";
            nameSpan.textContent = displayName;

            li.appendChild(avatar);
            li.appendChild(nameSpan);

            // Remove (unregister) button
            const removeBtn = document.createElement("button");
            removeBtn.className = "remove-btn";
            removeBtn.title = "Unregister participant";
            removeBtn.setAttribute("aria-label", `Remove ${displayName}`);
            removeBtn.innerHTML = "&times;"; // small x icon

            // wire up the delete handler
            removeBtn.addEventListener("click", async () => {
              try {
                const response = await fetch(
                  `/activities/${encodeURIComponent(name)}/participants?email=${encodeURIComponent(participant)}`,
                  {
                    method: "DELETE",
                  }
                );

                const result = await response.json();
                if (response.ok) {
                  messageDiv.textContent = result.message;
                  messageDiv.className = "success";
                  // refresh the list to reflect changes
                  fetchActivities();
                } else {
                  messageDiv.textContent = result.detail || "An error occurred";
                  messageDiv.className = "error";
                }
                messageDiv.classList.remove("hidden");
                setTimeout(() => {
                  messageDiv.classList.add("hidden");
                }, 4000);
              } catch (error) {
                messageDiv.textContent = "Failed to unregister. Please try again.";
                messageDiv.className = "error";
                messageDiv.classList.remove("hidden");
                console.error("Error unregistering:", error);
              }
            });

            li.appendChild(removeBtn);
            ul.appendChild(li);
          });

          activityCard.appendChild(ul);
        } else {
          const emptyP = document.createElement("p");
          emptyP.className = "no-participants";
          emptyP.textContent = "No participants yet — be the first to sign up!";
          activityCard.appendChild(emptyP);
        }

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities to show the newly registered participant without a full page refresh
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
