import sys
import os
sys.path.insert(0, '.')

from backend.agents.departments import DEPARTMENT_MAP

souls_dir = 'backend/agents/souls'
souls = os.listdir(souls_dir)

print("=" * 60)
print("MARKLY v2.0.0 - DEPARTMENT VERIFICATION")
print("=" * 60)
print(f"\nTotal departments registered: {len(DEPARTMENT_MAP)}")
print(f"Soul files in directory: {len(souls)}")
print()

missing_souls = []
missing_agents = []

for dept in sorted(DEPARTMENT_MAP.keys()):
    soul_file = f"{dept}.md"
    has_soul = soul_file in souls
    
    # Try to instantiate the agent
    try:
        agent_cls = DEPARTMENT_MAP[dept]
        agent = agent_cls()
        has_agent = True
    except Exception as e:
        has_agent = False
        missing_agents.append((dept, str(e)))
    
    if not has_soul:
        missing_souls.append(dept)
    
    status = "[+]" if (has_soul and has_agent) else "[-]"
    print(f"  {status} {dept:25s} soul={'YES' if has_soul else 'NO':3s} agent={'YES' if has_agent else 'NO':3s}")

print()
print("-" * 60)
print("SUMMARY")
print("-" * 60)

all_ok = True
if missing_souls:
    print(f"  Missing soul files: {', '.join(missing_souls)}")
    all_ok = False
else:
    print(f"  Missing soul files: None")

if missing_agents:
    print(f"  Missing/broken agents: {', '.join([m[0] for m in missing_agents])}")
    all_ok = False
else:
    print(f"  Missing/broken agents: None")

print()
if all_ok:
    print(f"  ALL {len(DEPARTMENT_MAP)} DEPARTMENTS VERIFIED")
else:
    print(f"  SOME DEPARTMENTS HAVE ISSUES - SEE ABOVE")
