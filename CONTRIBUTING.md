# Contributing to Markly AI Company Platform

Thank you for your interest in contributing to Markly! We welcome contributions from the community.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/Pruthvi7767/ai-company/issues)
2. Use the bug report template
3. Include:
   - Clear description of the issue
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, Python version, Node version)

### Suggesting Features

1. Check existing [Issues](https://github.com/Pruthvi7767/ai-company/issues) and [Discussions](https://github.com/Pruthvi7767/ai-company/discussions)
2. Use the feature request template
3. Describe the use case and benefits

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ai-company.git
cd ai-company

# Setup backend
cd backend
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Setup frontend
cd ../app
npm install
```

## Code Style

### Python
- Follow PEP 8
- Use type hints
- Write docstrings for functions and classes
- Maximum line length: 100 characters

### TypeScript/React
- Use functional components
- Use TypeScript for type safety
- Follow existing component patterns
- Use Tailwind CSS for styling

## Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd app
npm test
```

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
