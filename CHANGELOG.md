# Changelog

All notable changes to **Today's Done** will be documented in this file.

## [Unreleased]

## [0.2.1] - 2026-05-12

### Fixed

- Commit log not shown when current branch has no commits — now searches all branches (#7)
- Merge commits no longer appear in the commit log panel (#8)
- Commit log date mismatch for non-UTC timezones — `todayString()` now uses local date (#9)

## [0.2.0] - 2026-05-12

### Added

- Configurable project search directories — specify which workspace folders are scanned for projects (#1)
- Customizable copy template — define your own format when copying today's summary (#2)

## [0.1.0] - 2026-05-10

### Added

- Initial release
- Automatic work time tracking per project
- Status bar integration showing current tracking status
- Webview panel displaying daily activity and project details
- Copy today's summary to clipboard
- Git commit retrieval based on tracked projects
- Reset data command

[Unreleased]: https://github.com/restard/today-is-done/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/restard/today-is-done/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/restard/today-is-done/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/restard/today-is-done/releases/tag/v0.1.0
