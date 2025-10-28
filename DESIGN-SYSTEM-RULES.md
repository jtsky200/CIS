# 🎨 CADILLAC EV ASSISTANT - DESIGN SYSTEM RULES

## 🚨 **CRITICAL RULE: ALL COMPONENTS MUST MATCH WEBSITE DESIGN**

**Every component, modal, button, input, or UI element created MUST follow the established design system.**

---

## 📋 **DESIGN SYSTEM SPECIFICATIONS**

### 🎨 **Color Palette**
```css
/* Primary Colors */
--primary-text: #2d2d2d;           /* Main text color */
--secondary-text: #6b7280;        /* Secondary text, buttons */
--background: #ffffff;             /* Main background */
--surface: #fafafa;               /* Card/surface background */
--border: #e5e7eb;                /* Borders, dividers */

/* Button Colors */
--button-primary: #2d2d2d;        /* Primary buttons */
--button-secondary: #6b7280;      /* Secondary buttons */
--button-hover-primary: #1a1a1a;   /* Primary button hover */
--button-hover-secondary: #4b5563; /* Secondary button hover */
```

### 🔤 **Typography**
```css
/* Font Family */
font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

/* Font Sizes */
--text-xs: 12px;      /* Small text */
--text-sm: 14px;      /* Body text, buttons */
--text-base: 16px;    /* Default text */
--text-lg: 18px;      /* Large text */
--text-xl: 20px;      /* Headings */
--text-2xl: 28px;     /* Main headings */

/* Font Weights */
--font-normal: 400;   /* Normal text */
--font-medium: 500;   /* Medium text, buttons */
--font-semibold: 600; /* Semibold text */
```

### 📐 **Spacing & Layout**
```css
/* Padding */
--padding-xs: 8px;    /* Small padding */
--padding-sm: 12px;   /* Small-medium padding */
--padding-md: 16px;   /* Medium padding */
--padding-lg: 20px;   /* Large padding */
--padding-xl: 28px;   /* Extra large padding */

/* Border Radius */
--radius-sm: 6px;     /* Small radius */
--radius-md: 8px;     /* Medium radius */
--radius-lg: 12px;    /* Large radius (cards, modals) */

/* Shadows */
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);    /* Small shadow */
--shadow-md: 0 4px 20px rgba(0, 0, 0, 0.15);   /* Medium shadow */
```

---

## 🧩 **COMPONENT SPECIFICATIONS**

### 🔘 **Buttons**
```css
/* Primary Button */
background: #2d2d2d;
color: white;
padding: 10px 20px;
border-radius: 8px;
font-size: 14px;
font-weight: 500;
transition: all 0.2s ease;

/* Hover State */
background: #1a1a1a;

/* Secondary Button */
background: #6b7280;
color: white;
padding: 10px 20px;
border-radius: 8px;
font-size: 14px;
font-weight: 500;
transition: all 0.2s ease;

/* Hover State */
background: #4b5563;
```

### 📦 **Cards/Modals**
```css
/* Card/Modal Container */
background: white;
border-radius: 12px;
border: 1px solid #e5e7eb;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
padding: 28px;

/* Modal Overlay */
background: rgba(0, 0, 0, 0.5);
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
z-index: 10000;
```

### 📝 **Inputs**
```css
/* Input Fields */
background: white;
border: 1px solid #e5e7eb;
border-radius: 8px;
padding: 12px 16px;
font-size: 14px;
color: #2d2d2d;
font-family: Inter, system fonts;

/* Focus State */
border-color: #2d2d2d;
outline: none;
box-shadow: 0 0 0 3px rgba(45, 45, 45, 0.1);
```

### 🏷️ **Labels**
```css
/* Form Labels */
color: #2d2d2d;
font-size: 14px;
font-weight: 500;
margin-bottom: 8px;
```

---

## 🎭 **ANIMATIONS**

### ✨ **Transitions**
```css
/* Standard Transition */
transition: all 0.2s ease;

/* Fade In Animation */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Fade Out Animation */
@keyframes fadeOut {
    from { opacity: 1; transform: scale(1); }
    to { opacity: 0; transform: scale(0.95); }
}
```

---

## 🚫 **FORBIDDEN PRACTICES**

### ❌ **NEVER DO:**
- Use hardcoded colors not in the design system
- Use different font families
- Use different border radius values
- Use different padding/spacing values
- Use different shadow styles
- Create components without hover states
- Use browser alerts or confirmations
- Use different button styles
- Ignore the established color palette

### ✅ **ALWAYS DO:**
- Use the exact color values from the design system
- Use the Inter font family
- Use consistent spacing (8px, 12px, 16px, 20px, 28px)
- Use consistent border radius (6px, 8px, 12px)
- Use consistent shadows
- Add hover states to interactive elements
- Use custom modals instead of browser alerts
- Follow the established button patterns
- Test components for design compliance

---

## 🔍 **DESIGN COMPLIANCE CHECKLIST**

Before deploying any component, verify:

- [ ] Colors match the design system palette
- [ ] Typography uses Inter font family
- [ ] Spacing follows the 8px grid system
- [ ] Border radius is consistent (6px, 8px, 12px)
- [ ] Shadows match the established system
- [ ] Buttons have proper hover states
- [ ] No browser alerts or confirmations
- [ ] Animations are smooth and consistent
- [ ] Component matches existing UI patterns
- [ ] Responsive design is maintained

---

## 📚 **EXAMPLES**

### ✅ **CORRECT Modal Implementation:**
```css
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.modal-content {
    background: white;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    padding: 28px;
    max-width: 80%;
    max-height: 80%;
    width: 700px;
    animation: fadeIn 0.3s ease;
}
```

### ❌ **INCORRECT Modal Implementation:**
```css
.modal-overlay {
    background: rgba(0, 0, 0, 0.8); /* Wrong opacity */
    font-family: Arial, sans-serif; /* Wrong font */
}

.modal-content {
    border-radius: 4px; /* Wrong radius */
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3); /* Wrong shadow */
    padding: 20px; /* Wrong padding */
}
```

---

## 🎯 **IMPLEMENTATION RULE**

**EVERY TIME YOU CREATE, BUILD, OR MODIFY ANY UI COMPONENT:**

1. **Check this document first**
2. **Use the exact values specified**
3. **Test for design compliance**
4. **Verify no browser warnings**
5. **Ensure consistent user experience**

---

## 📝 **UPDATES**

This design system is living and should be updated when:
- New components are added
- Design patterns evolve
- User feedback requires changes
- New requirements emerge

**Last Updated:** December 2024
**Version:** 1.0
**Status:** Active and Enforced
