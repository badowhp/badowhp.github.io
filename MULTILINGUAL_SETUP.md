# Hugo Multilingual Setup Documentation

## Overview

This Hugo website supports English (EN) and German (DE) languages with proper language switching functionality. The setup follows Hugo's multilingual best practices for the `qubt` theme.

## Configuration Structure

### Language Configuration
**File:** [`config/_default/hugo.yaml`](config/_default/hugo.yaml:14-30)

```yaml
defaultContentLanguage: 'en'

languages:
  en:
    languageCode: 'en-US'
    languageName: 'English'
    weight: 1
    title: 'Hipolit Badowski IT Services'
    params:
      description: 'Professional IT Training, Cloud Consulting, DevOps Solutions & Web Hosting Services - Based in Vienna, Austria'
  de:
    languageCode: 'de-DE'
    languageName: 'Deutsch'
    weight: 2
    title: 'Hipolit Badowski IT-Dienstleistungen'
    params:
      description: 'Professionelle IT-Schulungen, Cloud-Beratung, DevOps-Lösungen & Web-Hosting-Services - Ansässig in Wien, Österreich'
```

### Menu Configuration

#### English Menu
**File:** [`config/_default/menus.yaml`](config/_default/menus.yaml)

```yaml
main:
- name: "Home"
  url: "/"
  weight: 10
- name: "Services"
  url: "/services/"
  weight: 20
- name: "Blog"
  url: "/blog/"
  weight: 30
- name: "About"
  url: "/about/"
  weight: 40
- name: "EN"
  url: "/"
  weight: 50
  params:
    class: "language-switcher"
    lang: "en"
- name: "DE"
  url: "/de/"
  weight: 60
  params:
    class: "language-switcher"
    lang: "de"
```

#### German Menu
**File:** [`config/_default/menus.de.yaml`](config/_default/menus.de.yaml)

```yaml
main:
- name: "Startseite"
  url: "/de/"
  weight: 10
- name: "Dienstleistungen"
  url: "/de/services/"
  weight: 20
- name: "Blog"
  url: "/de/blog/"
  weight: 30
- name: "Über mich"
  url: "/de/about/"
  weight: 40
- name: "EN"
  url: "/"
  weight: 50
  params:
    class: "language-switcher"
    lang: "en"
- name: "DE"
  url: "/de/"
  weight: 60
  params:
    class: "language-switcher"
    lang: "de"
```

## Content Structure

### Directory Layout
```
content/
├── _index.md              # English homepage
├── about.md               # English about page
├── services/
│   └── _index.md          # English services page
├── blog/
│   └── _index.md          # English blog index
└── de/                    # German content directory
    ├── _index.md          # German homepage
    ├── about.md           # German about page
    ├── services/
    │   └── _index.md      # German services page
    └── blog/
        └── _index.md      # German blog index
```

### Translation Files

#### English Translations
**File:** [`i18n/en.yaml`](i18n/en.yaml)

Contains English translations for:
- Navigation items
- Service categories
- Common UI elements
- Page content strings

#### German Translations
**File:** [`i18n/de.yaml`](i18n/de.yaml)

Contains German translations for:
- Navigation items (Startseite, Dienstleistungen, etc.)
- Service categories
- Common UI elements
- Page content strings

## URL Structure

### English URLs
- Homepage: `/`
- Services: `/services/`
- Blog: `/blog/`
- About: `/about/`

### German URLs
- Homepage: `/de/`
- Services: `/de/services/`
- Blog: `/de/blog/`
- About: `/de/about/`

## Language Switching

The language switcher is implemented through menu items with special parameters:

```yaml
- name: "EN"
  url: "/"
  params:
    class: "language-switcher"
    lang: "en"
- name: "DE"
  url: "/de/"
  params:
    class: "language-switcher"
    lang: "de"
```

## Key Features

### ✅ Working Features
- **Bidirectional Language Switching**: Users can switch between EN and DE from any page
- **Proper URL Structure**: German content uses `/de/` prefix
- **Localized Navigation**: Menu items are translated for each language
- **Content Translation**: All main pages have German equivalents
- **SEO-Friendly**: Proper language codes and meta information

### 🔧 Implementation Details
- **Theme Compatibility**: Works with the `qubt` theme
- **Hugo Multilingual**: Uses Hugo's built-in multilingual support
- **Content Organization**: Language-specific content in separate directories
- **Menu Localization**: Separate menu files for each language

## Maintenance

### Adding New Content
1. **English Content**: Add to `content/` directory
2. **German Content**: Add equivalent file to `content/de/` directory
3. **Menu Updates**: Update both `menus.yaml` and `menus.de.yaml` if needed

### Adding New Languages
1. Add language configuration to [`hugo.yaml`](config/_default/hugo.yaml)
2. Create new menu file: `config/_default/menus.[lang].yaml`
3. Create translation file: `i18n/[lang].yaml`
4. Create content directory: `content/[lang]/`
5. Update language switcher in all menu files

## Testing

The multilingual setup has been tested and verified:
- ✅ Language switching works bidirectionally
- ✅ All German pages render correctly
- ✅ Navigation menus are properly localized
- ✅ URLs follow correct multilingual structure
- ✅ Content is properly translated

## Troubleshooting

### Common Issues
1. **Missing German Content**: Ensure all English content has German equivalents
2. **Broken Language Switching**: Check menu URL configurations
3. **Wrong Language Display**: Verify `defaultContentLanguage` setting
4. **Menu Not Translated**: Check language-specific menu files

### Verification Steps
1. Test language switching from homepage
2. Verify all German pages load correctly
3. Check that navigation menus are localized
4. Confirm URL structure follows `/de/` pattern for German content

---

**Last Updated:** August 18, 2025  
**Hugo Version:** Compatible with Hugo v0.100+  
**Theme:** qubt (github.com/chrede88/qubt)