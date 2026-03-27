"""
Signal Copilot for Interviews - Phase 1 Mockup
Real-time Audio Telemetry Dashboard (Mock Data)

Powered by Microsoft Azure, GitHub Copilot
"""

import gradio as gr
import plotly.graph_objects as go
import numpy as np
import time
from datetime import datetime
import random

# Theme and styling configuration
CUSTOM_CSS = """
/* Dark Mode Theme */
body, .gradio-container {
    background-color: #1a1a1a !important;
    color: #ffffff !important;
}

/* Large font sizes */
.gradio-container {
    font-size: 18px !important;
}

h1, h2, h3 {
    font-size: 32px !important;
    font-weight: 600 !important;
    margin-bottom: 20px !important;
}

.metric-display {
    font-size: 48px !important;
    font-weight: bold !important;
    text-align: center !important;
    padding: 30px !important;
}

/* Azure blue accent */
.accent-azure {
    color: #0078D4 !important;
}

/* GitHub accent */
.accent-github {
    color: #2ea043 !important;
}

/* Alert colors */
.alert-warning {
    background-color: #ffc107 !important;
    color: #000000 !important;
    padding: 20px !important;
    border-radius: 8px !important;
    font-size: 24px !important;
    font-weight: bold !important;
}

.alert-success {
    background-color: #2ea043 !important;
    color: #ffffff !important;
    padding: 20px !important;
    border-radius: 8px !important;
    font-size: 24px !important;
    font-weight: bold !important;
}

/* Brand header */
.brand-header {
    display: flex !important;
    align-items: center !important;
    gap: 20px !important;
    padding: 20px !important;
    background: linear-gradient(135deg, #0078D4 0%, #2ea043 100%) !important;
    border-radius: 12px !important;
    margin-bottom: 30px !important;
}

/* Card styling */
.metric-card {
    background-color: #2d2d2d !important;
    border: 2px solid #404040 !important;
    border-radius: 12px !important;
    padding: 30px !important;
    margin: 15px 0 !important;
}
"""

# Mock data state
class MockDataState:
    def __init__(self):
        self.db_history = []
        self.wpm_history = []
        self.time_history = []
        self.start_time = time.time()
        self.alert_start_time = None
        self.alert_duration = 5.0  # 5 seconds alert duration
        self.current_alert_type = None
        
    def generate_db_level(self):
        """Generate mock dB level (40-80 dB range)"""
        # Occasional "too quiet" or "too loud" alerts
        rand = random.random()
        if rand < 0.15:
            return random.uniform(35, 45)  # Too quiet
        elif rand < 0.25:
            return random.uniform(78, 85)  # Too loud
        return random.uniform(55, 75)  # Normal range
    
    def generate_wpm(self):
        """Generate mock WPM (120-180 WPM range)"""
        # Occasional "too fast" alerts
        if random.random() < 0.12:
            return random.uniform(185, 220)  # Too fast
        return random.uniform(140, 170)  # Normal range
    
    def update_data(self):
        """Update mock data history"""
        current_time = time.time() - self.start_time
        self.time_history.append(current_time)
        self.db_history.append(self.generate_db_level())
        self.wpm_history.append(self.generate_wpm())
        
        # Keep last 50 data points
        if len(self.time_history) > 50:
            self.time_history = self.time_history[-50:]
            self.db_history = self.db_history[-50:]
            self.wpm_history = self.wpm_history[-50:]
    
    def should_show_alert(self, current_db, current_wpm):
        """Check if alert should be shown (with 5-second persistence)"""
        db_ok = 50 <= current_db <= 75
        wpm_ok = 130 <= current_wpm <= 180
        
        current_time = time.time()
        
        # If there's an active alert, check if it's still within duration
        if self.alert_start_time is not None:
            elapsed = current_time - self.alert_start_time
            if elapsed < self.alert_duration:
                return True, self.current_alert_type
            else:
                # Alert expired, reset
                self.alert_start_time = None
                self.current_alert_type = None
        
        # Check for new alerts
        if not db_ok or not wpm_ok:
            alerts = []
            if not db_ok:
                if current_db < 50:
                    alerts.append("too_quiet")
                else:
                    alerts.append("too_loud")
            if not wpm_ok:
                if current_wpm > 180:
                    alerts.append("too_fast")
                else:
                    alerts.append("too_slow")
            
            # Start new alert
            self.alert_start_time = current_time
            self.current_alert_type = alerts
            return True, alerts
        
        return False, []

# Global state
mock_state = MockDataState()

def create_header_html():
    """Create branded header with MS/GitHub/Azure logos"""
    return """
    <div style="background: linear-gradient(135deg, #0078D4 0%, #2ea043 50%, #24292F 100%); 
                padding: 40px; 
                border-radius: 16px; 
                text-align: center;
                margin-bottom: 30px;">
        <h1 style="font-size: 48px; font-weight: bold; color: white; margin: 0;">
            🎤 Signal Copilot for Interviews
        </h1>
        <p style="font-size: 28px; color: #e0e0e0; margin-top: 15px;">
            Phase 1: Real-time Audio Telemetry Dashboard
        </p>
        <div style="margin-top: 25px; font-size: 20px; color: #ffffff;">
            <span style="margin: 0 15px;">⚡ Powered by <b>Azure</b></span>
            <span style="margin: 0 15px;">🤖 Built with <b>GitHub Copilot</b></span>
            <span style="margin: 0 15px;">☁️ Orchestrated on <b>k3s</b></span>
        </div>
    </div>
    """

def create_db_chart():
    """Create dB level time-series chart"""
    if len(mock_state.db_history) < 2:
        return go.Figure()
    
    fig = go.Figure()
    
    # Add dB trace
    fig.add_trace(go.Scatter(
        x=mock_state.time_history,
        y=mock_state.db_history,
        mode='lines+markers',
        name='dB Level',
        line=dict(color='#0078D4', width=3),
        marker=dict(size=8, color='#0078D4'),
        fill='tozeroy',
        fillcolor='rgba(0, 120, 212, 0.2)'
    ))
    
    # Add optimal range zones
    fig.add_hrect(y0=50, y1=75, 
                  fillcolor='rgba(46, 160, 67, 0.1)', 
                  line_width=0,
                  annotation_text="Optimal Range",
                  annotation_position="top right")
    
    # Add threshold lines
    fig.add_hline(y=50, line_dash="dash", line_color="#2ea043", line_width=2)
    fig.add_hline(y=75, line_dash="dash", line_color="#2ea043", line_width=2)
    
    # Dark theme styling
    fig.update_layout(
        template='plotly_dark',
        paper_bgcolor='#1a1a1a',
        plot_bgcolor='#2d2d2d',
        font=dict(size=18, color='#ffffff'),
        title=dict(text='🎚️ dB Level Over Time', font=dict(size=24)),
        xaxis_title='Time (seconds)',
        yaxis_title='Decibels (dB)',
        showlegend=True,
        height=400,
        margin=dict(l=60, r=60, t=80, b=60),
        yaxis=dict(range=[30, 90])
    )
    
    return fig

def create_wpm_chart():
    """Create WPM time-series chart"""
    if len(mock_state.wpm_history) < 2:
        return go.Figure()
    
    fig = go.Figure()
    
    # Add WPM trace
    fig.add_trace(go.Scatter(
        x=mock_state.time_history,
        y=mock_state.wpm_history,
        mode='lines+markers',
        name='Words/Min',
        line=dict(color='#2ea043', width=3),
        marker=dict(size=8, color='#2ea043'),
        fill='tozeroy',
        fillcolor='rgba(46, 160, 67, 0.2)'
    ))
    
    # Add optimal range zones
    fig.add_hrect(y0=130, y1=180, 
                  fillcolor='rgba(0, 120, 212, 0.1)', 
                  line_width=0,
                  annotation_text="Optimal Range",
                  annotation_position="top right")
    
    # Add threshold lines
    fig.add_hline(y=130, line_dash="dash", line_color="#0078D4", line_width=2)
    fig.add_hline(y=180, line_dash="dash", line_color="#0078D4", line_width=2)
    
    # Dark theme styling
    fig.update_layout(
        template='plotly_dark',
        paper_bgcolor='#1a1a1a',
        plot_bgcolor='#2d2d2d',
        font=dict(size=18, color='#ffffff'),
        title=dict(text='⚡ Words Per Minute Over Time', font=dict(size=24)),
        xaxis_title='Time (seconds)',
        yaxis_title='WPM',
        showlegend=True,
        height=400,
        margin=dict(l=60, r=60, t=80, b=60),
        yaxis=dict(range=[100, 230])
    )
    
    return fig

def update_dashboard():
    """Update all dashboard components with new mock data"""
    mock_state.update_data()
    
    current_db = mock_state.db_history[-1] if mock_state.db_history else 60
    current_wpm = mock_state.wpm_history[-1] if mock_state.wpm_history else 150
    
    # Check if alert should be shown (with 5-second persistence)
    show_alert, alert_types = mock_state.should_show_alert(current_db, current_wpm)
    
    db_ok = 50 <= current_db <= 75
    wpm_ok = 130 <= current_wpm <= 180
    
    # Create status message (persists for 5 seconds)
    if show_alert and alert_types:
        alerts = []
        for alert_type in alert_types:
            if alert_type == "too_quiet":
                alerts.append("🔇 Speaking too quietly")
            elif alert_type == "too_loud":
                alerts.append("📢 Speaking too loudly")
            elif alert_type == "too_fast":
                alerts.append("⚡ Speaking too fast")
            elif alert_type == "too_slow":
                alerts.append("🐌 Speaking too slowly")
        
        status_html = f"""
        <div style="background-color: #ffc107; padding: 30px; border-radius: 12px; text-align: center;">
            <h2 style="font-size: 36px; color: #000; margin: 0;">⚠️ Signal Alert</h2>
            <p style="font-size: 24px; color: #000; margin-top: 10px;">{' | '.join(alerts)}</p>
        </div>
        """
    else:
        status_html = """
        <div style="background-color: #2ea043; padding: 30px; border-radius: 12px; text-align: center;">
            <h2 style="font-size: 36px; color: white; margin: 0;">✅ Signal Clear</h2>
            <p style="font-size: 24px; color: #e0e0e0; margin-top: 10px;">Optimal communication range</p>
        </div>
        """
    
    # Create metrics HTML (1-column layout)
    metrics_html = f"""
    <div style="display: flex; flex-direction: column; gap: 30px; margin: 30px 0;">
        <div style="background-color: #2d2d2d; padding: 40px; border-radius: 12px; border: 3px solid {'#2ea043' if db_ok else '#ffc107'};">
            <h3 style="font-size: 28px; color: #0078D4; text-align: center;">🎚️ dB Level</h3>
            <div style="font-size: 64px; font-weight: bold; text-align: center; color: {'#2ea043' if db_ok else '#ffc107'};">
                {current_db:.1f}
            </div>
            <p style="font-size: 20px; text-align: center; color: #a0a0a0; margin-top: 10px;">
                Optimal: 50-75 dB
            </p>
        </div>
        <div style="background-color: #2d2d2d; padding: 40px; border-radius: 12px; border: 3px solid {'#2ea043' if wpm_ok else '#ffc107'};">
            <h3 style="font-size: 28px; color: #0078D4; text-align: center;">⚡ Words/Min</h3>
            <div style="font-size: 64px; font-weight: bold; text-align: center; color: {'#2ea043' if wpm_ok else '#ffc107'};">
                {current_wpm:.0f}
            </div>
            <p style="font-size: 20px; text-align: center; color: #a0a0a0; margin-top: 10px;">
                Optimal: 130-180 WPM
            </p>
        </div>
    </div>
    """
    
    # Create charts
    db_chart = create_db_chart()
    wpm_chart = create_wpm_chart()
    
    return status_html, metrics_html, db_chart, wpm_chart

# Create Gradio interface
def create_interface():
    with gr.Blocks(title="Signal Copilot - Phase 1") as demo:
        # Header
        gr.HTML(create_header_html())

        # Status and metrics
        status_display = gr.HTML(value="<p style='font-size: 24px; text-align: center;'>Initializing dashboard...</p>")
        metrics_display = gr.HTML(value="")

        # Charts section (1-column layout)
        gr.Markdown("## 📊 Real-time Signal Trends")
        
        db_chart = gr.Plot(label="dB Level Monitoring")
        wpm_chart = gr.Plot(label="WPM Monitoring")

        # Footer info
        gr.Markdown("""
        <div style="margin-top: 40px; padding: 30px; background-color: #2d2d2d; border-radius: 12px; text-align: center;">
            <p style="font-size: 20px; color: #a0a0a0;">
                <b>Mock Data Dashboard</b> | Phase 1: Signal Foundation<br>
                Real-time updates every 2 seconds | Built with Gradio + Azure + GitHub Copilot
            </p>
        </div>
        """)

        # Auto-update mechanism using Timer for Gradio 6.x
        timer = gr.Timer(2)
        timer.tick(
            fn=update_dashboard,
            inputs=[],
            outputs=[status_display, metrics_display, db_chart, wpm_chart],
        )
    
    return demo

if __name__ == "__main__":
    demo = create_interface()
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=True,
        show_error=True,
        css=CUSTOM_CSS,
    )
