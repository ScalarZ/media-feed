export function selectTemplate(
  template: "CHANGE_PASSWORD" | "RESET_PASSWORD",
  token: string,
  origin: string
) {
  const templates = {
    CHANGE_PASSWORD: {
      subject: "Change password",
      text: `
            Change password
            ${origin}/change-password?token=${token}
            `,
      html: `
            <h1>Change password</h1>
            <a target="_blank" rel="noopener noreferrer" href='${origin}/change-password?token=${token}'>Click here to change your password</a>
            `,
    },
    RESET_PASSWORD: {
      subject: "Reset password",
      text: `
            Reset password
            ${origin}/reset-password?token=${token}
            `,
      html: `
            <h1>Reset password</h1>
            <a target="_blank" rel="noopener noreferrer" href='${origin}/reset-password?token=${token}'>Click here to reset your password</a>
            `,
    },
  };
  return templates[template];
}
